/**
 * Layer visibility verification utilities
 * Implements Requirements: 2.2, 3.1 - Layer visibility verification and timing
 * Implements Requirements: 3.2 - Debounced color scheme change handling
 */

import maplibregl from 'maplibre-gl';
import { performanceMonitor } from './performance-utils';

/**
 * Result of layer visibility verification
 */
export interface VisibilityVerificationResult {
  success: boolean;
  layerId: string;
  expectedVisibility: 'visible' | 'none';
  actualVisibility: 'visible' | 'none' | null;
  duration: number;
  error?: string;
}

/**
 * Options for visibility verification
 */
export interface VisibilityVerificationOptions {
  timeout?: number; // Maximum time to wait for verification (default: 100ms)
  retryInterval?: number; // Interval between verification attempts (default: 10ms)
  context?: string; // Context for logging
}

/**
 * Verify that a layer's visibility was applied successfully
 * Requirements: 2.2, 3.1 - Verify layer visibility changes within 100ms with performance monitoring
 */
export async function verifyLayerVisibility(
  map: maplibregl.Map | null,
  layerId: string,
  expectedVisibility: 'visible' | 'none',
  options: VisibilityVerificationOptions = {}
): Promise<VisibilityVerificationResult> {
  const {
    timeout = 100, // 100ms max as per requirements
    retryInterval = 10, // Check every 10ms
    context = ''
  } = options;

  const operationId = `verify-${layerId}-${Date.now()}`;
  const startTime = performance.now();
  
  // Start performance monitoring
  layerVisibilityPerformanceMonitor.startOperation(operationId, layerId, 'verify', context);

  // Early validation
  if (!map) {
    const duration = performance.now() - startTime;
    const result: VisibilityVerificationResult = {
      success: false,
      layerId,
      expectedVisibility,
      actualVisibility: null,
      duration,
      error: 'Map not available for verification'
    };
    
    layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, 'verify', false, context);
    console.error(`❌ Layer visibility verification failed for ${layerId}: Map not available${context ? ` (${context})` : ''}`);
    return result;
  }

  // Check if layer exists
  if (!map.getLayer(layerId)) {
    const duration = performance.now() - startTime;
    const result: VisibilityVerificationResult = {
      success: false,
      layerId,
      expectedVisibility,
      actualVisibility: null,
      duration,
      error: `Layer ${layerId} not found`
    };
    
    layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, 'verify', false, context);
    console.error(`❌ Layer visibility verification failed for ${layerId}: Layer not found${context ? ` (${context})` : ''}`);
    return result;
  }

  // Verification loop with timeout
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      const duration = performance.now() - startTime;
      const actualVisibility = getCurrentVisibility(map, layerId);
      const result: VisibilityVerificationResult = {
        success: false,
        layerId,
        expectedVisibility,
        actualVisibility,
        duration,
        error: `Verification timeout after ${timeout}ms`
      };
      
      layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, 'verify', false, context);
      console.error(`❌ Layer visibility verification timeout for ${layerId}: Expected ${expectedVisibility}, got ${actualVisibility} after ${duration.toFixed(2)}ms${context ? ` (${context})` : ''}`);
      resolve(result);
    }, timeout);

    const checkVisibility = () => {
      try {
        const actualVisibility = getCurrentVisibility(map, layerId);
        
        if (actualVisibility === expectedVisibility) {
          clearTimeout(timeoutId);
          const duration = performance.now() - startTime;
          const result: VisibilityVerificationResult = {
            success: true,
            layerId,
            expectedVisibility,
            actualVisibility,
            duration
          };
          
          layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, 'verify', true, context);
          console.log(`✅ Layer visibility verified for ${layerId}: ${expectedVisibility} in ${duration.toFixed(2)}ms${context ? ` (${context})` : ''}`);
          resolve(result);
          return;
        }

        // Schedule next check
        setTimeout(checkVisibility, retryInterval);
      } catch (error) {
        clearTimeout(timeoutId);
        const duration = performance.now() - startTime;
        const result: VisibilityVerificationResult = {
          success: false,
          layerId,
          expectedVisibility,
          actualVisibility: null,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error during verification'
        };
        
        layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, 'verify', false, context);
        console.error(`❌ Layer visibility verification error for ${layerId}:`, error, `${context ? ` (${context})` : ''}`);
        resolve(result);
      }
    };

    // Start verification
    checkVisibility();
  });
}

/**
 * Get current visibility of a layer, handling edge cases
 */
function getCurrentVisibility(map: maplibregl.Map, layerId: string): 'visible' | 'none' | null {
  try {
    const visibility = map.getLayoutProperty(layerId, 'visibility');
    
    // Handle undefined/null as 'visible' (MapLibre default)
    if (visibility === undefined || visibility === null) {
      return 'visible';
    }
    
    // Ensure we return only valid visibility values
    if (visibility === 'visible' || visibility === 'none') {
      return visibility;
    }
    
    // Handle unexpected values
    console.warn(`⚠️ Unexpected visibility value for ${layerId}: ${visibility}`);
    return 'visible'; // Default to visible for unexpected values
  } catch (error) {
    console.error(`❌ Error getting visibility for ${layerId}:`, error);
    return null;
  }
}

/**
 * Verify multiple layers' visibility in parallel
 * Requirements: 2.1 - Synchronize visibility for both itinerary layers consistently
 */
export async function verifyMultipleLayersVisibility(
  map: maplibregl.Map | null,
  layerVisibilityMap: Record<string, 'visible' | 'none'>,
  options: VisibilityVerificationOptions = {}
): Promise<VisibilityVerificationResult[]> {
  const { context = '' } = options;
  
;
  
  const verificationPromises = Object.entries(layerVisibilityMap).map(([layerId, expectedVisibility]) =>
    verifyLayerVisibility(map, layerId, expectedVisibility, options)
  );

  const results = await Promise.all(verificationPromises);
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  if (successCount !== totalCount) {
    console.error(`❌ ${totalCount - successCount} of ${totalCount} layer visibility verifications failed${context ? ` (${context})` : ''}`);
  }
  
  return results;
}

/**
 * Batch verification result for multiple operations
 */
export interface BatchVerificationResult {
  success: boolean;
  results: VisibilityVerificationResult[];
  totalDuration: number;
  successCount: number;
  failureCount: number;
  context?: string;
}

/**
 * Verify layer visibility changes for itinerary mode transitions
 * Requirements: 1.1, 1.2, 1.3, 1.4 - Proper layer hiding/showing on tab switches
 */
export async function verifyItineraryModeTransition(
  map: maplibregl.Map | null,
  targetMode: 'itineraries' | 'non-itineraries',
  options: VisibilityVerificationOptions = {}
): Promise<BatchVerificationResult> {
  const startTime = performance.now();
  const { context = '' } = options;
  
  const expectedVisibility: 'visible' | 'none' = targetMode === 'itineraries' ? 'visible' : 'none';
  const layersToVerify: Record<string, 'visible' | 'none'> = {
    'itinerary': expectedVisibility,
    'itinerary-labels': expectedVisibility,
    'itinerary-highlight': expectedVisibility
  };
  
;
  
  const results = await verifyMultipleLayersVisibility(map, layersToVerify, {
    ...options,
    context: `${context} - ${targetMode} transition`
  });
  
  const totalDuration = performance.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  const batchResult: BatchVerificationResult = {
    success: successCount === results.length,
    results,
    totalDuration,
    successCount,
    failureCount,
    context: `${context} - ${targetMode} transition`
  };
  
  if (!batchResult.success) {
    console.error(`❌ Itinerary mode transition to ${targetMode} verification failed: ${failureCount} failures in ${totalDuration.toFixed(2)}ms${context ? ` (${context})` : ''}`);
  }
  
  return batchResult;
}

/**
 * Enhanced cleanup logic for switching away from itineraries mode
 * Requirements: 1.1, 1.2, 1.3, 2.4, 3.1 - Ensure proper cleanup when leaving itineraries mode with performance monitoring
 */
export async function performItineraryCleanup(
  map: maplibregl.Map | null,
  options: VisibilityVerificationOptions = {}
): Promise<BatchVerificationResult> {
  const startTime = performance.now();
  const { context = 'itinerary cleanup' } = options;
  const operationId = `cleanup-${Date.now()}`;
  
  // Start performance monitoring for cleanup operation
  layerVisibilityPerformanceMonitor.startOperation(operationId, 'itinerary-cleanup', 'cleanup', context);
;
  
  if (!map) {
    const result: BatchVerificationResult = {
      success: false,
      results: [],
      totalDuration: performance.now() - startTime,
      successCount: 0,
      failureCount: 1,
      context
    };
    layerVisibilityPerformanceMonitor.endOperation(operationId, 'itinerary-cleanup', 'cleanup', false, context);
    console.error(`❌ Itinerary cleanup failed: Map not available${context ? ` (${context})` : ''}`);
    return result;
  }

  const cleanupOperations: Array<() => Promise<VisibilityVerificationResult>> = [];

  // 1. Hide itinerary, itinerary-labels, and itinerary-highlight layers
  const itineraryLayers = ['itinerary', 'itinerary-labels', 'itinerary-highlight'];
  for (const layerId of itineraryLayers) {
    cleanupOperations.push(async () => {
      try {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', 'none');
;
        }
        return await verifyLayerVisibility(map, layerId, 'none', {
          ...options,
          context: `${context} - hide ${layerId}`
        });
      } catch (error) {
        console.error(`❌ Error hiding ${layerId} during cleanup:`, error);
        return {
          success: false,
          layerId,
          expectedVisibility: 'none' as const,
          actualVisibility: null,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  }

  // 2. Remove terrain when leaving itineraries mode
  cleanupOperations.push(async () => {
    try {
      map.setTerrain(null);
;
      return {
        success: true,
        layerId: 'terrain',
        expectedVisibility: 'none' as const,
        actualVisibility: 'none' as const,
        duration: 0
      };
    } catch (error) {
      console.error('❌ Error disabling terrain during cleanup:', error);
      return {
        success: false,
        layerId: 'terrain',
        expectedVisibility: 'none' as const,
        actualVisibility: null,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // 3. Hide hillshade when leaving itineraries mode
  cleanupOperations.push(async () => {
    try {
      if (map.getLayer('hillshade')) {
        map.setLayoutProperty('hillshade', 'visibility', 'none');
;
      }
      return await verifyLayerVisibility(map, 'hillshade', 'none', {
        ...options,
        context: `${context} - hide hillshade`
      });
    } catch (error) {
      console.error('❌ Error hiding hillshade during cleanup:', error);
      return {
        success: false,
        layerId: 'hillshade',
        expectedVisibility: 'none' as const,
        actualVisibility: null,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Execute all cleanup operations
  const results = await Promise.all(cleanupOperations.map(op => op()));
  
  const totalDuration = performance.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  const batchResult: BatchVerificationResult = {
    success: successCount === results.length,
    results,
    totalDuration,
    successCount,
    failureCount,
    context
  };
  
  // End performance monitoring for cleanup operation
  layerVisibilityPerformanceMonitor.endOperation(operationId, 'itinerary-cleanup', 'cleanup', batchResult.success, context);
  
  if (!batchResult.success) {
    console.error(`❌ Enhanced itinerary cleanup failed: ${failureCount} failures in ${totalDuration.toFixed(2)}ms${context ? ` (${context})` : ''}`);
  }
  
  return batchResult;
}

/**
 * Layer creation verification for itineraries mode
 * Requirements: 3.4 - Check layer existence before making visible
 */
export interface LayerCreationResult {
  success: boolean;
  layerId: string;
  existed: boolean;
  created: boolean;
  error?: string;
}

/**
 * Verify and create missing layers for itineraries mode
 * Requirements: 3.4, 3.1 - Ensure layers exist before making them visible with performance monitoring
 */
export async function verifyAndCreateItineraryLayers(
  map: maplibregl.Map | null,
  options: VisibilityVerificationOptions = {}
): Promise<LayerCreationResult[]> {
  const { context = 'layer creation verification' } = options;
  const operationId = `create-layers-${Date.now()}`;
  
  // Start performance monitoring for layer creation
  layerVisibilityPerformanceMonitor.startOperation(operationId, 'itinerary-layers', 'create', context);
;
  
  if (!map) {
    layerVisibilityPerformanceMonitor.endOperation(operationId, 'itinerary-layers', 'create', false, context);
    console.error(`❌ Layer creation verification failed: Map not available${context ? ` (${context})` : ''}`);
    return [{
      success: false,
      layerId: 'map',
      existed: false,
      created: false,
      error: 'Map not available'
    }];
  }

  const results: LayerCreationResult[] = [];
  
  // Check and create itinerary layer
  const itineraryResult = await verifyAndCreateLayer(map, 'itinerary', {
    id: 'itinerary',
    type: 'line',
    source: 'country-border',
    'source-layer': 'itinerary',
    paint: {
      'line-color': '#ef4444',
      'line-width': 4,
      'line-opacity': 0.5
    },
    layout: {
      'visibility': 'none' // Start hidden, will be shown when switching to itineraries mode
    }
  }, context);
  results.push(itineraryResult);

  // Check and create itinerary-labels layer if it doesn't exist
  const labelsResult = await verifyAndCreateLayer(map, 'itinerary-labels', {
    id: 'itinerary-labels',
    type: 'symbol',
    source: 'country-border',
    'source-layer': 'itinerary',
    paint: {
      'text-color': '#ef4444',
      'text-halo-color': '#ffffff',
      'text-halo-width': 2
    },
    layout: {
      'text-field': ['get', 'itineraryId'],
      'text-font': ['Roboto Bold'],
      'text-size': 14,
      'text-anchor': 'center',
      'text-offset': [0, 0],
      'visibility': 'none' // Start hidden, will be shown when switching to itineraries mode
    }
  }, context);
  results.push(labelsResult);

  // Check and create itinerary-highlight layer if it doesn't exist
  const highlightResult = await verifyAndCreateLayer(map, 'itinerary-highlight', {
    id: 'itinerary-highlight',
    type: 'line',
    source: 'country-border',
    'source-layer': 'itinerary',
    paint: {
      'line-color': '#ffffff', // White color for visibility
      'line-width': 6, // Wider than default itinerary line (4px)
      'line-opacity': 1.0 // Full opacity for better visibility
    },
    filter: ['==', ['get', 'itineraryDocId'], ''], // Initially show nothing
    layout: {
      'visibility': 'none' // Start hidden, will be shown when switching to itineraries mode
    }
  }, context);
  results.push(highlightResult);

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const allSuccessful = successCount === totalCount;
  
  // End performance monitoring for layer creation
  layerVisibilityPerformanceMonitor.endOperation(operationId, 'itinerary-layers', 'create', allSuccessful, context);
  
  if (!allSuccessful) {
    console.error(`❌ ${totalCount - successCount} of ${totalCount} itinerary layer verifications failed${context ? ` (${context})` : ''}`);
  }
  
  return results;
}

/**
 * Helper function to verify and create a single layer
 */
async function verifyAndCreateLayer(
  map: maplibregl.Map,
  layerId: string,
  layerSpec: any,
  context: string
): Promise<LayerCreationResult> {
  try {
    const existed = !!map.getLayer(layerId);
    
    if (existed) {
;
      return {
        success: true,
        layerId,
        existed: true,
        created: false
      };
    }

    // Check if source exists before creating layer
    if (!map.getSource('country-border')) {
      console.error(`❌ Cannot create ${layerId}: country-border source not found${context ? ` (${context})` : ''}`);
      return {
        success: false,
        layerId,
        existed: false,
        created: false,
        error: 'country-border source not found'
      };
    }

    // Create the layer
    map.addLayer(layerSpec);
;
    
    return {
      success: true,
      layerId,
      existed: false,
      created: true
    };
  } catch (error) {
    console.error(`❌ Error verifying/creating layer ${layerId}:`, error, `${context ? ` (${context})` : ''}`);
    return {
      success: false,
      layerId,
      existed: false,
      created: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Debounced color scheme change handler
 * Requirements: 3.2 - Add debouncing to prevent race conditions during rapid switching
 */
export interface ColorSchemeChangeOptions {
  debounceMs?: number; // Default: 150ms
  maxPendingOperations?: number; // Default: 3
  context?: string;
}

export interface PendingOperation {
  id: string;
  colorScheme: string;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
  cleanup?: () => void;
}

/**
 * Debounced color scheme change manager
 * Ensures final state matches final color scheme selection and handles cleanup
 */
export class DebouncedColorSchemeManager {
  private pendingOperations: Map<string, PendingOperation> = new Map();
  private operationCounter = 0;

  /**
   * Schedule a debounced color scheme change operation
   * Requirements: 3.2 - Ensure final state matches final color scheme selection
   */
  scheduleColorSchemeChange(
    colorScheme: string,
    operation: () => Promise<void> | void,
    options: ColorSchemeChangeOptions = {}
  ): string {
    const {
      debounceMs = 150, // Slightly longer than the current 100ms for better stability
      maxPendingOperations = 3,
      context = 'color scheme change'
    } = options;

    // Generate unique operation ID
    const operationId = `color-scheme-${++this.operationCounter}`;
    const timestamp = performance.now();

    // Cancel any existing operations for the same context
    this.cancelPendingOperations(context);

    // Limit the number of pending operations to prevent memory leaks
    if (this.pendingOperations.size >= maxPendingOperations) {
      console.warn(`⚠️ Maximum pending operations (${maxPendingOperations}) reached, canceling oldest`);
      this.cancelOldestOperation();
    }

    performanceMonitor.mark(`debounced-color-change-${operationId}`);

    // Create timeout for the operation
    const timeoutId = setTimeout(async () => {
      const pendingOp = this.pendingOperations.get(operationId);
      if (!pendingOp) {
        console.warn(`⚠️ Operation ${operationId} not found when executing`);
        return;
      }

      try {

        
        // Execute the operation
        await operation();
        
        const duration = performanceMonitor.measure(`debounced-color-change-${operationId}`);
        
        // Log warning if operation took longer than 100ms (requirement 3.1)
        if (duration > 100) {
          console.warn(`⚠️ Color scheme change took ${duration.toFixed(2)}ms, exceeding 100ms requirement (${operationId}) - ${context}`);
        }
        
      } catch (error) {
        console.error(`❌ Error in debounced color scheme change to '${colorScheme}' (${operationId}):`, error, `- ${context}`);
      } finally {
        // Clean up the operation
        this.pendingOperations.delete(operationId);
      }
    }, debounceMs);

    // Store the pending operation
    const pendingOperation: PendingOperation = {
      id: operationId,
      colorScheme,
      timestamp,
      timeoutId,
      cleanup: () => {
        clearTimeout(timeoutId);
        performanceMonitor.clear(`debounced-color-change-${operationId}`);
      }
    };

    this.pendingOperations.set(operationId, pendingOperation);
    
    return operationId;
  }

  /**
   * Cancel pending operations for a specific context
   */
  private cancelPendingOperations(context: string): void {
    let canceledCount = 0;
    
    this.pendingOperations.forEach((operation, operationId) => {
      if (operation.cleanup) {
        operation.cleanup();
      }
      this.pendingOperations.delete(operationId);
      canceledCount++;
    });


  }

  /**
   * Cancel the oldest pending operation
   */
  private cancelOldestOperation(): void {
    let oldestOperation: PendingOperation | null = null;
    let oldestOperationId: string | null = null;

    this.pendingOperations.forEach((operation, operationId) => {
      if (!oldestOperation || operation.timestamp < oldestOperation.timestamp) {
        oldestOperation = operation;
        oldestOperationId = operationId;
      }
    });

    if (oldestOperation && oldestOperationId) {
      const operation = oldestOperation as PendingOperation;
      if (operation.cleanup) {
        operation.cleanup();
      }
      this.pendingOperations.delete(oldestOperationId);
;
    }
  }

  /**
   * Cancel a specific operation by ID
   */
  cancelOperation(operationId: string): boolean {
    const operation = this.pendingOperations.get(operationId);
    if (!operation) {
      return false;
    }

    if (operation.cleanup) {
      operation.cleanup();
    }
    
    this.pendingOperations.delete(operationId);
;
    return true;
  }

  /**
   * Cancel all pending operations
   * Requirements: 3.2 - Add timeout cleanup for pending operations
   */
  cancelAllOperations(): void {
    const operationCount = this.pendingOperations.size;
    
    this.pendingOperations.forEach((operation, operationId) => {
      if (operation.cleanup) {
        operation.cleanup();
      }
    });
    
    this.pendingOperations.clear();
    

  }

  /**
   * Get information about pending operations
   */
  getPendingOperationsInfo(): Array<{
    id: string;
    colorScheme: string;
    timestamp: number;
    age: number;
  }> {
    const now = performance.now();
    
    return Array.from(this.pendingOperations.values()).map(operation => ({
      id: operation.id,
      colorScheme: operation.colorScheme,
      timestamp: operation.timestamp,
      age: now - operation.timestamp
    }));
  }

  /**
   * Check if there are any pending operations
   */
  hasPendingOperations(): boolean {
    return this.pendingOperations.size > 0;
  }

  /**
   * Get the number of pending operations
   */
  getPendingOperationCount(): number {
    return this.pendingOperations.size;
  }
}

/**
 * Global debounced color scheme manager instance
 */
export const debouncedColorSchemeManager = new DebouncedColorSchemeManager();

/**
 * Performance monitoring for layer visibility changes
 * Requirements: 3.1 - Track timing of visibility change operations and log warnings for operations > 100ms
 */
export interface LayerVisibilityPerformanceMetrics {
  operationId: string;
  layerId: string;
  operation: 'show' | 'hide' | 'verify' | 'create' | 'cleanup';
  duration: number;
  timestamp: number;
  success: boolean;
  context?: string;
  warning?: string;
}

/**
 * Layer visibility performance monitor
 * Tracks and analyzes performance of layer visibility operations
 */
export class LayerVisibilityPerformanceMonitor {
  private metrics: LayerVisibilityPerformanceMetrics[] = [];
  private maxMetricsHistory = 1000; // Keep last 1000 operations
  private performanceThreshold = 100; // 100ms threshold per requirements
  private operationStartTimes: Map<string, number> = new Map();

  /**
   * Start tracking a layer visibility operation
   */
  startOperation(operationId: string, layerId: string, operation: LayerVisibilityPerformanceMetrics['operation'], context?: string): void {
    this.operationStartTimes.set(operationId, performance.now());
;
  }

  /**
   * End tracking a layer visibility operation and record metrics
   */
  endOperation(
    operationId: string, 
    layerId: string, 
    operation: LayerVisibilityPerformanceMetrics['operation'], 
    success: boolean, 
    context?: string
  ): LayerVisibilityPerformanceMetrics {
    const startTime = this.operationStartTimes.get(operationId);
    const duration = startTime ? performance.now() - startTime : 0;
    const timestamp = performance.now();
    
    // Clean up start time
    this.operationStartTimes.delete(operationId);
    
    // Check if operation exceeded performance threshold
    let warning: string | undefined;
    if (duration > this.performanceThreshold) {
      warning = `Operation exceeded ${this.performanceThreshold}ms threshold`;
      console.warn(`⚠️ Layer visibility ${operation} for '${layerId}' took ${duration.toFixed(2)}ms (exceeds ${this.performanceThreshold}ms requirement) (${operationId})${context ? ` - ${context}` : ''}`);
    }

    const metric: LayerVisibilityPerformanceMetrics = {
      operationId,
      layerId,
      operation,
      duration,
      timestamp,
      success,
      context,
      warning
    };

    // Add to metrics history
    this.metrics.push(metric);
    
    // Trim history if it gets too large
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    return metric;
  }

  /**
   * Get performance statistics for layer visibility operations
   */
  getPerformanceStats(): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageDuration: number;
    slowOperations: number;
    slowOperationPercentage: number;
    operationsByType: Record<string, number>;
    recentSlowOperations: LayerVisibilityPerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        slowOperations: 0,
        slowOperationPercentage: 0,
        operationsByType: {},
        recentSlowOperations: []
      };
    }

    const totalOperations = this.metrics.length;
    const successfulOperations = this.metrics.filter(m => m.success).length;
    const failedOperations = totalOperations - successfulOperations;
    const averageDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
    const slowOperations = this.metrics.filter(m => m.duration > this.performanceThreshold).length;
    const slowOperationPercentage = (slowOperations / totalOperations) * 100;

    // Count operations by type
    const operationsByType: Record<string, number> = {};
    this.metrics.forEach(metric => {
      operationsByType[metric.operation] = (operationsByType[metric.operation] || 0) + 1;
    });

    // Get recent slow operations (last 10)
    const recentSlowOperations = this.metrics
      .filter(m => m.duration > this.performanceThreshold)
      .slice(-10);

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageDuration,
      slowOperations,
      slowOperationPercentage,
      operationsByType,
      recentSlowOperations
    };
  }

  /**
   * Get metrics for a specific layer
   */
  getLayerMetrics(layerId: string): LayerVisibilityPerformanceMetrics[] {
    return this.metrics.filter(m => m.layerId === layerId);
  }

  /**
   * Get metrics for a specific operation type
   */
  getOperationMetrics(operation: LayerVisibilityPerformanceMetrics['operation']): LayerVisibilityPerformanceMetrics[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  /**
   * Get recent metrics (last N operations)
   */
  getRecentMetrics(count: number = 50): LayerVisibilityPerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
;
  }

  /**
   * Log performance summary to console
   */
  logPerformanceSummary(): void {
    const stats = this.getPerformanceStats();
    
    console.group('📊 Layer Visibility Performance Summary');
    console.log(`Total Operations: ${stats.totalOperations}`);
    console.log(`Successful: ${stats.successfulOperations} (${((stats.successfulOperations / stats.totalOperations) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${stats.failedOperations} (${((stats.failedOperations / stats.totalOperations) * 100).toFixed(1)}%)`);
    console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`Slow Operations (>${this.performanceThreshold}ms): ${stats.slowOperations} (${stats.slowOperationPercentage.toFixed(1)}%)`);
    
    console.log('Operations by Type:');
    Object.entries(stats.operationsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    if (stats.recentSlowOperations.length > 0) {
      console.log('Recent Slow Operations:');
      stats.recentSlowOperations.forEach(op => {
        console.log(`  ${op.layerId} (${op.operation}): ${op.duration.toFixed(2)}ms - ${op.context || 'no context'}`);
      });
    }
    
    console.groupEnd();
  }

  /**
   * Set performance threshold (default: 100ms)
   */
  setPerformanceThreshold(thresholdMs: number): void {
    this.performanceThreshold = thresholdMs;
;
  }

  /**
   * Get current performance threshold
   */
  getPerformanceThreshold(): number {
    return this.performanceThreshold;
  }
}

/**
 * Global layer visibility performance monitor instance
 */
export const layerVisibilityPerformanceMonitor = new LayerVisibilityPerformanceMonitor();

/**
 * Enhanced safeSetLayerVisibility with performance monitoring
 * Requirements: 2.2, 2.3, 3.1 - Enhanced layer visibility with verification, retry logic, and performance monitoring
 */
export async function safeSetLayerVisibility(
  map: maplibregl.Map | null,
  layerId: string,
  visibility: 'visible' | 'none',
  options: VisibilityVerificationOptions & { retries?: number } = {}
): Promise<VisibilityVerificationResult> {
  const {
    timeout = 100,
    retryInterval = 10,
    context = '',
    retries = 3
  } = options;

  const operationId = `safe-set-${layerId}-${Date.now()}`;
  const operation = visibility === 'visible' ? 'show' : 'hide';
  
  // Start performance monitoring
  layerVisibilityPerformanceMonitor.startOperation(operationId, layerId, operation, context);

  if (!map) {
    const result: VisibilityVerificationResult = {
      success: false,
      layerId,
      expectedVisibility: visibility,
      actualVisibility: null,
      duration: 0,
      error: 'Map not available'
    };
    
    layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, operation, false, context);
    console.error(`❌ Safe layer visibility change failed for ${layerId}: Map not available${context ? ` (${context})` : ''}`);
    return result;
  }

  let lastError: string | undefined;
  
  // Retry logic for failed operations
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Check if layer exists
      if (!map.getLayer(layerId)) {
        const result: VisibilityVerificationResult = {
          success: false,
          layerId,
          expectedVisibility: visibility,
          actualVisibility: null,
          duration: 0,
          error: `Layer ${layerId} not found (attempt ${attempt}/${retries})`
        };
        
        if (attempt === retries) {
          layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, operation, false, context);
          console.error(`❌ Safe layer visibility change failed for ${layerId}: Layer not found after ${retries} attempts${context ? ` (${context})` : ''}`);
        }
        
        lastError = result.error;
        continue;
      }

      // Set the visibility
      map.setLayoutProperty(layerId, 'visibility', visibility);
;

      // Verify the change was applied
      const verificationResult = await verifyLayerVisibility(map, layerId, visibility, {
        timeout,
        retryInterval,
        context: `${context} - safe set attempt ${attempt}`
      });

      if (verificationResult.success) {
        layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, operation, true, context);
        return verificationResult;
      }

      lastError = verificationResult.error;
      
      if (attempt < retries) {
        console.warn(`⚠️ Safe layer visibility change attempt ${attempt}/${retries} failed for ${layerId}, retrying...${context ? ` (${context})` : ''}`);
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 20));
      }

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      
      if (attempt < retries) {
        console.warn(`⚠️ Safe layer visibility change attempt ${attempt}/${retries} threw error for ${layerId}, retrying:`, error, `${context ? ` (${context})` : ''}`);
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }
  }

  // All retries failed
  const result: VisibilityVerificationResult = {
    success: false,
    layerId,
    expectedVisibility: visibility,
    actualVisibility: null,
    duration: 0,
    error: `All ${retries} attempts failed. Last error: ${lastError}`
  };
  
  layerVisibilityPerformanceMonitor.endOperation(operationId, layerId, operation, false, context);
  console.error(`❌ Safe layer visibility change failed for ${layerId} after ${retries} attempts: ${lastError}${context ? ` (${context})` : ''}`);
  return result;
}
/**
 * Utility functions for accessing performance monitoring from components
 */

/**
 * Log current performance statistics to console
 */
export function logLayerVisibilityPerformanceStats(): void {
  layerVisibilityPerformanceMonitor.logPerformanceSummary();
}

/**
 * Get layer visibility performance statistics
 */
export function getLayerVisibilityPerformanceStats() {
  return layerVisibilityPerformanceMonitor.getPerformanceStats();
}

/**
 * Clear layer visibility performance metrics
 */
export function clearLayerVisibilityPerformanceMetrics(): void {
  layerVisibilityPerformanceMonitor.clearMetrics();
}

/**
 * Set performance threshold for warnings (default: 100ms)
 */
export function setLayerVisibilityPerformanceThreshold(thresholdMs: number): void {
  layerVisibilityPerformanceMonitor.setPerformanceThreshold(thresholdMs);
}

/**
 * Get recent slow operations
 */
export function getRecentSlowLayerOperations(count: number = 10) {
  const stats = layerVisibilityPerformanceMonitor.getPerformanceStats();
  return stats.recentSlowOperations.slice(-count);
}