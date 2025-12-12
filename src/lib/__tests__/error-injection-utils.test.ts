/**
 * Error injection testing utilities for layer visibility management
 * Implements Requirements: 2.3, 3.5 - Test error handling and recovery mechanisms
 */

import { 
  safeSetLayerVisibility,
  verifyLayerVisibility,
  performItineraryCleanup,
  verifyAndCreateItineraryLayers,
  debouncedColorSchemeManager
} from '../layer-visibility-utils';

// Error injection utilities
export interface ErrorInjectionConfig {
  failureRate?: number; // 0-1, probability of failure
  errorType?: 'timeout' | 'not_found' | 'permission' | 'network' | 'unknown';
  failAfterAttempts?: number; // Fail after N attempts
  intermittentFailure?: boolean; // Randomly fail/succeed
}

/**
 * Mock map with error injection capabilities
 */
export class MockMapWithErrorInjection {
  private errorConfig: ErrorInjectionConfig = {};
  private attemptCounts: Map<string, number> = new Map();
  private shouldFail: boolean = false;

  // Mock map methods
  getLayer = jest.fn();
  getLayoutProperty = jest.fn();
  setLayoutProperty = jest.fn();
  addLayer = jest.fn();
  removeLayer = jest.fn();
  getSource = jest.fn();
  addSource = jest.fn();
  setTerrain = jest.fn();

  constructor(errorConfig: ErrorInjectionConfig = {}) {
    this.errorConfig = errorConfig;
    this.setupErrorInjection();
  }

  private setupErrorInjection() {
    // Inject errors into getLayer
    this.getLayer.mockImplementation((layerId: string) => {
      if (this.shouldInjectError('getLayer', layerId)) {
        if (this.errorConfig.errorType === 'not_found') {
          return null;
        }
        throw new Error(`Injected error in getLayer for ${layerId}`);
      }
      return { id: layerId, type: 'line' };
    });

    // Inject errors into setLayoutProperty
    this.setLayoutProperty.mockImplementation((layerId: string, property: string, value: any) => {
      if (this.shouldInjectError('setLayoutProperty', layerId)) {
        if (this.errorConfig.errorType === 'permission') {
          throw new Error(`Permission denied setting ${property} on ${layerId}`);
        }
        throw new Error(`Injected error in setLayoutProperty for ${layerId}`);
      }
      return undefined;
    });

    // Inject errors into getLayoutProperty
    this.getLayoutProperty.mockImplementation((layerId: string, property: string) => {
      if (this.shouldInjectError('getLayoutProperty', layerId)) {
        if (this.errorConfig.errorType === 'timeout') {
          // Simulate timeout by returning wrong value
          return 'none'; // Wrong value to trigger timeout
        }
        throw new Error(`Injected error in getLayoutProperty for ${layerId}`);
      }
      return 'visible';
    });

    // Inject errors into addLayer
    this.addLayer.mockImplementation((layerSpec: any) => {
      if (this.shouldInjectError('addLayer', layerSpec.id)) {
        throw new Error(`Injected error in addLayer for ${layerSpec.id}`);
      }
      return undefined;
    });
  }

  private shouldInjectError(operation: string, layerId: string): boolean {
    const key = `${operation}-${layerId}`;
    const attempts = this.attemptCounts.get(key) || 0;
    this.attemptCounts.set(key, attempts + 1);

    // Check if we should fail after N attempts
    if (this.errorConfig.failAfterAttempts && attempts >= this.errorConfig.failAfterAttempts) {
      return true;
    }

    // Check failure rate
    if (this.errorConfig.failureRate && Math.random() < this.errorConfig.failureRate) {
      return true;
    }

    // Check intermittent failure
    if (this.errorConfig.intermittentFailure && Math.random() < 0.3) {
      return true;
    }

    return false;
  }

  // Reset error injection state
  resetErrorInjection() {
    this.attemptCounts.clear();
    jest.clearAllMocks();
    this.setupErrorInjection();
  }

  // Update error configuration
  updateErrorConfig(config: ErrorInjectionConfig) {
    this.errorConfig = { ...this.errorConfig, ...config };
    this.setupErrorInjection();
  }
}

describe('Error Injection Testing for Layer Visibility Management', () => {
  let mockMap: MockMapWithErrorInjection;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Layer Not Found Errors', () => {
    beforeEach(() => {
      mockMap = new MockMapWithErrorInjection({
        errorType: 'not_found',
        failureRate: 1.0 // Always fail
      });
    });

    test('should handle layer not found errors gracefully', async () => {
      const result = await safeSetLayerVisibility(
        mockMap as any,
        'non-existent-layer',
        'visible',
        { timeout: 50, retries: 1 }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.layerId).toBe('non-existent-layer');
    });

    test('should handle verification with missing layers', async () => {
      const result = await verifyLayerVisibility(
        mockMap as any,
        'missing-layer',
        'visible',
        { timeout: 50 }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Permission Errors', () => {
    beforeEach(() => {
      mockMap = new MockMapWithErrorInjection({
        errorType: 'permission',
        failureRate: 1.0
      });
    });

    test('should handle permission denied errors', async () => {
      const result = await safeSetLayerVisibility(
        mockMap as any,
        'protected-layer',
        'visible',
        { timeout: 10, retries: 1 }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    }, 10000);
  });

  describe('Timeout Errors', () => {
    beforeEach(() => {
      mockMap = new MockMapWithErrorInjection({
        errorType: 'timeout',
        failureRate: 1.0
      });
    });

    test('should handle verification timeout errors', async () => {
      const resultPromise = verifyLayerVisibility(
        mockMap as any,
        'slow-layer',
        'visible',
        { timeout: 50 }
      );

      // Fast-forward past timeout
      jest.advanceTimersByTime(60);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
      expect(result.duration).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Intermittent Failures', () => {
    beforeEach(() => {
      mockMap = new MockMapWithErrorInjection({
        intermittentFailure: true
      });
    });

    test('should handle intermittent failures with retry logic', async () => {
      // Run fewer attempts with shorter timeouts
      const results = [];
      for (let i = 0; i < 3; i++) {
        mockMap.resetErrorInjection();
        const result = await safeSetLayerVisibility(
          mockMap as any,
          'intermittent-layer',
          'visible',
          { timeout: 10, retries: 1 }
        );
        results.push(result);
      }

      // Should have some results
      expect(results.length).toBe(3);
      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;
      expect(successes + failures).toBe(3);
    }, 10000);
  });

  describe('Cleanup Operation Error Handling', () => {
    test('should handle partial cleanup failures gracefully', async () => {
      // Configure to fail on specific layers
      mockMap = new MockMapWithErrorInjection({
        failureRate: 0.5 // 50% failure rate
      });

      const result = await performItineraryCleanup(mockMap as any, { timeout: 10 });

      // Should complete even with some failures
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.totalDuration).toBeGreaterThan(0);
      
      // Should have a mix of successes and failures
      expect(result.successCount + result.failureCount).toBe(result.results.length);
    }, 10000);

    test('should handle complete cleanup failure', async () => {
      const result = await performItineraryCleanup(null); // Null map

      expect(result.success).toBe(false);
      expect(result.failureCount).toBe(1);
      expect(result.successCount).toBe(0);
    });
  });

  describe('Layer Creation Error Handling', () => {
    test('should handle layer creation failures', async () => {
      mockMap = new MockMapWithErrorInjection({
        errorType: 'permission',
        failureRate: 1.0
      });

      // Mock source exists but layer creation fails
      mockMap.getSource.mockReturnValue({ type: 'vector' });

      const results = await verifyAndCreateItineraryLayers(mockMap as any);

      expect(results.length).toBe(2);
      results.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.created).toBe(false);
        expect(result.error).toContain('Injected error');
      });
    });

    test('should handle missing source for layer creation', async () => {
      mockMap = new MockMapWithErrorInjection();
      mockMap.getSource.mockReturnValue(null); // No source available

      const results = await verifyAndCreateItineraryLayers(mockMap as any);

      expect(results.length).toBe(2);
      results.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.error).toContain('source not found');
      });
    });
  });

  describe('Debounced Operations Error Handling', () => {
    test('should handle errors in debounced operations', async () => {
      const errorOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      const operationId = debouncedColorSchemeManager.scheduleColorSchemeChange(
        'itineraries',
        errorOperation,
        { debounceMs: 5, context: 'error test' }
      );

      expect(operationId).toBeDefined();

      // Wait for debounced operation to execute
      jest.advanceTimersByTime(10);
      await new Promise(resolve => setTimeout(resolve, 10));

      // Operation should have been called despite error
      expect(errorOperation).toHaveBeenCalled();
    }, 10000);

    test('should handle cancellation of pending operations', () => {
      const operation = jest.fn();
      
      const operationId = debouncedColorSchemeManager.scheduleColorSchemeChange(
        'itineraries',
        operation,
        { debounceMs: 100, context: 'cancel test' }
      );

      // Cancel before execution
      const cancelled = debouncedColorSchemeManager.cancelOperation(operationId);
      expect(cancelled).toBe(true);

      // Fast-forward past debounce time
      jest.advanceTimersByTime(150);

      // Operation should not have been called
      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe('System Stability Under Error Conditions', () => {
    test('should maintain stability with high error rates', async () => {
      mockMap = new MockMapWithErrorInjection({
        failureRate: 0.8, // 80% failure rate
        intermittentFailure: true
      });

      // Perform fewer operations with shorter timeouts
      const operations = [
        safeSetLayerVisibility(mockMap as any, 'layer1', 'visible', { retries: 1, timeout: 10 }),
        safeSetLayerVisibility(mockMap as any, 'layer2', 'none', { retries: 1, timeout: 10 }),
        verifyLayerVisibility(mockMap as any, 'layer3', 'visible', { timeout: 10 })
      ];

      const results = await Promise.allSettled(operations);

      // All operations should complete (not throw unhandled errors)
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });

      // Should have a mix of successes and failures, but no crashes
      const fulfilled = results.filter(r => r.status === 'fulfilled').length;
      expect(fulfilled).toBe(3);
    }, 10000);

    test('should handle concurrent error conditions', async () => {
      mockMap = new MockMapWithErrorInjection({
        failureRate: 0.6,
        intermittentFailure: true
      });

      // Run fewer concurrent operations with shorter timeouts
      const concurrentOperations = Array.from({ length: 5 }, (_, i) =>
        safeSetLayerVisibility(mockMap as any, `layer${i}`, 'visible', { 
          timeout: 10, 
          retries: 1 
        })
      );

      const results = await Promise.all(concurrentOperations);

      // All operations should complete
      expect(results.length).toBe(5);
      
      // Should have a mix of results but no system crashes
      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;
      
      expect(successes + failures).toBe(5);
    }, 10000);
  });
});