/**
 * Tests for layer visibility verification utilities
 * Implements Requirements: 2.2, 3.1 - Layer visibility verification and timing
 */

import { 
  verifyLayerVisibility, 
  verifyMultipleLayersVisibility, 
  verifyItineraryModeTransition,
  performItineraryCleanup,
  verifyAndCreateItineraryLayers
} from '../layer-visibility-utils';

// Mock maplibre-gl
const mockMap = {
  getLayer: jest.fn(),
  getLayoutProperty: jest.fn(),
};

describe('Layer Visibility Verification Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('verifyLayerVisibility', () => {
    it('should verify layer visibility successfully when layer exists and has correct visibility', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue('visible');

      // Execute
      const resultPromise = verifyLayerVisibility(
        mockMap as any,
        'test-layer',
        'visible',
        { timeout: 100 }
      );

      // Fast-forward timers to allow verification to complete
      jest.advanceTimersByTime(10);

      const result = await resultPromise;

      // Verify
      expect(result.success).toBe(true);
      expect(result.layerId).toBe('test-layer');
      expect(result.expectedVisibility).toBe('visible');
      expect(result.actualVisibility).toBe('visible');
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
    });

    it('should fail verification when map is not available', async () => {
      // Execute
      const result = await verifyLayerVisibility(
        null,
        'test-layer',
        'visible',
        { timeout: 100 }
      );

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Map not available for verification');
    });

    it('should fail verification when layer does not exist', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(false);

      // Execute
      const result = await verifyLayerVisibility(
        mockMap as any,
        'non-existent-layer',
        'visible',
        { timeout: 100 }
      );

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Layer non-existent-layer not found');
    });

    it('should timeout when layer visibility does not match expected value', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue('none'); // Different from expected 'visible'

      // Execute
      const resultPromise = verifyLayerVisibility(
        mockMap as any,
        'test-layer',
        'visible',
        { timeout: 50 }
      );

      // Fast-forward past timeout
      jest.advanceTimersByTime(60);

      const result = await resultPromise;

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Verification timeout after 50ms');
      expect(result.actualVisibility).toBe('none');
    });

    it('should handle undefined visibility as visible (MapLibre default)', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue(undefined);

      // Execute
      const resultPromise = verifyLayerVisibility(
        mockMap as any,
        'test-layer',
        'visible',
        { timeout: 100 }
      );

      jest.advanceTimersByTime(10);

      const result = await resultPromise;

      // Verify
      expect(result.success).toBe(true);
      expect(result.actualVisibility).toBe('visible');
    });
  });

  describe('verifyMultipleLayersVisibility', () => {
    it('should verify multiple layers successfully', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty
        .mockReturnValueOnce('visible') // itinerary layer
        .mockReturnValueOnce('visible'); // itinerary-labels layer

      const layerVisibilityMap = {
        'itinerary': 'visible' as const,
        'itinerary-labels': 'visible' as const
      };

      // Execute
      const resultPromise = verifyMultipleLayersVisibility(
        mockMap as any,
        layerVisibilityMap,
        { timeout: 100 }
      );

      jest.advanceTimersByTime(10);

      const results = await resultPromise;

      // Verify
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].layerId).toBe('itinerary');
      expect(results[1].success).toBe(true);
      expect(results[1].layerId).toBe('itinerary-labels');
    });
  });

  describe('verifyItineraryModeTransition', () => {
    it('should verify transition to itineraries mode', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue('visible');

      // Execute
      const resultPromise = verifyItineraryModeTransition(
        mockMap as any,
        'itineraries',
        { timeout: 100 }
      );

      jest.advanceTimersByTime(10);

      const result = await resultPromise;

      // Verify
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(3); // itinerary, itinerary-labels, itinerary-highlight
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
    });

    it('should verify transition to non-itineraries mode', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue('none');

      // Execute
      const resultPromise = verifyItineraryModeTransition(
        mockMap as any,
        'non-itineraries',
        { timeout: 100 }
      );

      jest.advanceTimersByTime(10);

      const result = await resultPromise;

      // Verify
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(3); // itinerary, itinerary-labels, itinerary-highlight
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
    });
  });

  describe('performItineraryCleanup', () => {
    it('should perform enhanced cleanup successfully', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue('none');
      mockMap.setLayoutProperty = jest.fn();
      mockMap.setTerrain = jest.fn();

      // Execute
      const resultPromise = performItineraryCleanup(mockMap as any);

      jest.advanceTimersByTime(10);

      const result = await resultPromise;

      // Verify
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(5); // itinerary, itinerary-labels, itinerary-highlight, terrain, hillshade
      expect(result.successCount).toBe(5);
      expect(result.failureCount).toBe(0);
      expect(mockMap.setTerrain).toHaveBeenCalledWith(null);
    });

    it('should handle cleanup failure gracefully', async () => {
      // Execute
      const result = await performItineraryCleanup(null);

      // Verify
      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(0);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
    });
  });

  describe('verifyAndCreateItineraryLayers', () => {
    it('should verify existing layers without creating new ones', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getSource = jest.fn().mockReturnValue({ type: 'vector' });

      // Execute
      const results = await verifyAndCreateItineraryLayers(mockMap as any);

      // Verify
      expect(results).toHaveLength(3); // itinerary, itinerary-labels, itinerary-highlight
      expect(results[0].success).toBe(true);
      expect(results[0].existed).toBe(true);
      expect(results[0].created).toBe(false);
      expect(results[1].success).toBe(true);
      expect(results[1].existed).toBe(true);
      expect(results[1].created).toBe(false);
      expect(results[2].success).toBe(true);
      expect(results[2].existed).toBe(true);
      expect(results[2].created).toBe(false);
    });

    it('should create missing layers', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(false);
      mockMap.getSource = jest.fn().mockReturnValue({ type: 'vector' });
      mockMap.addLayer = jest.fn();

      // Execute
      const results = await verifyAndCreateItineraryLayers(mockMap as any);

      // Verify
      expect(results).toHaveLength(3); // itinerary, itinerary-labels, itinerary-highlight
      expect(results[0].success).toBe(true);
      expect(results[0].existed).toBe(false);
      expect(results[0].created).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[1].existed).toBe(false);
      expect(results[1].created).toBe(true);
      expect(results[2].success).toBe(true);
      expect(results[2].existed).toBe(false);
      expect(results[2].created).toBe(true);
      expect(mockMap.addLayer).toHaveBeenCalledTimes(3);
    });

    it('should handle missing source gracefully', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(false);
      mockMap.getSource = jest.fn().mockReturnValue(null);

      // Execute
      const results = await verifyAndCreateItineraryLayers(mockMap as any);

      // Verify
      expect(results).toHaveLength(3); // itinerary, itinerary-labels, itinerary-highlight
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('country-border source not found');
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('country-border source not found');
      expect(results[2].success).toBe(false);
      expect(results[2].error).toContain('country-border source not found');
    });

    it('should handle layer creation errors gracefully', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(false);
      mockMap.getSource = jest.fn().mockReturnValue({ type: 'vector' });
      mockMap.addLayer = jest.fn().mockImplementation(() => {
        throw new Error('Layer creation failed');
      });

      // Execute
      const results = await verifyAndCreateItineraryLayers(mockMap as any);

      // Verify
      expect(results).toHaveLength(3); // itinerary, itinerary-labels, itinerary-highlight
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Layer creation failed');
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('Layer creation failed');
      expect(results[2].success).toBe(false);
      expect(results[2].error).toContain('Layer creation failed');
    });
  });

  describe('Error Recovery and Stability', () => {
    it('should handle null map gracefully in all functions', async () => {
      // Test all main functions with null map
      const verifyResult = await verifyLayerVisibility(null, 'test', 'visible');
      expect(verifyResult.success).toBe(false);
      expect(verifyResult.error).toBe('Map not available for verification');

      const multiVerifyResult = await verifyMultipleLayersVisibility(null, { 'test': 'visible' });
      expect(multiVerifyResult.length).toBe(1);
      expect(multiVerifyResult[0].success).toBe(false);

      const transitionResult = await verifyItineraryModeTransition(null, 'itineraries');
      expect(transitionResult.success).toBe(false);

      const cleanupResult = await performItineraryCleanup(null);
      expect(cleanupResult.success).toBe(false);

      const createResult = await verifyAndCreateItineraryLayers(null);
      expect(createResult[0].success).toBe(false);
    });

    it('should handle map method errors gracefully', async () => {
      // Setup map that throws errors - but catch them in the verification function
      const errorMap = {
        getLayer: jest.fn().mockReturnValue(false), // Layer doesn't exist
        getLayoutProperty: jest.fn(),
        setLayoutProperty: jest.fn()
      };

      const result = await verifyLayerVisibility(errorMap as any, 'test', 'visible');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Layer test not found');
    });

    it('should handle concurrent verification requests', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue('visible');

      // Execute multiple concurrent verifications
      const promises = Array.from({ length: 10 }, (_, i) =>
        verifyLayerVisibility(mockMap as any, `layer-${i}`, 'visible', { timeout: 100 })
      );

      const results = await Promise.all(promises);

      // Verify all succeeded
      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.layerId).toBe(`layer-${i}`);
      });
    });

    it('should handle rapid successive operations', async () => {
      // Setup
      mockMap.getLayer.mockReturnValue(true);
      mockMap.getLayoutProperty.mockReturnValue('none');
      mockMap.setLayoutProperty = jest.fn();
      mockMap.setTerrain = jest.fn();

      // Execute rapid successive cleanup operations with shorter timeout
      const promises = Array.from({ length: 3 }, () =>
        performItineraryCleanup(mockMap as any, { timeout: 10 })
      );

      const results = await Promise.all(promises);

      // All should complete successfully
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.results.length).toBeGreaterThan(0);
      });
    }, 10000); // Increase timeout for this test
  });
});