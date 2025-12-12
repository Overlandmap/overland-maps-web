/**
 * Map performance optimizations for itinerary labels
 * Implements Requirements: 3.2 - Performance optimization during map interactions
 */

import { debounce, throttle, performanceMonitor, BatchProcessor } from './performance-utils';
import { verifyLayerVisibility, VisibilityVerificationResult } from './layer-visibility-utils';

/**
 * Optimized layer visibility manager with batching and debouncing
 */
export class OptimizedLayerManager {
  private map: maplibregl.Map | null = null;
  private visibilityBatch: BatchProcessor<{
    layerId: string;
    visibility: 'visible' | 'none';
    context?: string;
  }>;
  private propertyBatch: BatchProcessor<{
    layerId: string;
    property: string;
    value: any;
    type: 'layout' | 'paint';
  }>;

  // Debounced functions for performance optimization
  private debouncedVisibilityUpdate: (layerId: string, visibility: 'visible' | 'none', context?: string) => void;
  private throttledPropertyUpdate: (layerId: string, property: string, value: any, type: 'layout' | 'paint') => void;

  constructor() {
    // Batch visibility updates to reduce map operations
    this.visibilityBatch = new BatchProcessor(
      (updates) => this.processBatchedVisibilityUpdates(updates),
      5, // Batch size
      50  // Flush delay (ms)
    );

    // Batch property updates to reduce map operations
    this.propertyBatch = new BatchProcessor(
      (updates) => this.processBatchedPropertyUpdates(updates),
      10, // Batch size
      100 // Flush delay (ms)
    );

    // Debounce visibility updates to prevent excessive calls during rapid changes
    this.debouncedVisibilityUpdate = debounce(
      (layerId: string, visibility: 'visible' | 'none', context?: string) => {
        this.visibilityBatch.add({ layerId, visibility, context });
      },
      50 // 50ms debounce
    );

    // Throttle property updates to limit frequency during continuous interactions
    this.throttledPropertyUpdate = throttle(
      (layerId: string, property: string, value: any, type: 'layout' | 'paint') => {
        this.propertyBatch.add({ layerId, property, value, type });
      },
      100 // 100ms throttle
    );
  }

  /**
   * Set the map instance
   */
  setMap(map: maplibregl.Map | null): void {
    this.map = map;
  }

  /**
   * Enhanced layer visibility setter with verification and retry logic
   * Requirements: 2.2, 2.3 - Add verification step and retry logic for failed operations
   */
  async setLayerVisibility(layerId: string, visibility: 'visible' | 'none', context: string = ''): Promise<boolean> {
    if (!this.map) {
      console.warn(`⚠️ Map not available for layer visibility change: ${layerId}`);
      return false;
    }

    performanceMonitor.mark(`visibility-${layerId}`);

    try {
      if (!this.map.getLayer(layerId)) {
        console.warn(`⚠️ Layer ${layerId} not found when trying to set visibility${context ? ` (${context})` : ''}`);
        return false;
      }

      // Get current visibility to avoid unnecessary changes
      const currentVisibility = this.map.getLayoutProperty(layerId, 'visibility') || 'visible';
      
      if (currentVisibility !== visibility) {
        // Attempt to set visibility with retry logic (up to 3 attempts)
        const success = await this.setVisibilityWithRetry(layerId, visibility, context, 3);
        
        const duration = performanceMonitor.measure(`visibility-${layerId}`);
        if (duration > 100) {
          console.warn(`⚠️ Layer visibility change for ${layerId} took ${duration.toFixed(2)}ms (target: <100ms)${context ? ` (${context})` : ''}`);
        }
        
        return success;
      } else {
        console.log(`ℹ️ ${layerId} visibility already ${visibility}${context ? ` (${context})` : ''}`);
        performanceMonitor.measure(`visibility-${layerId}`);
        return true;
      }
    } catch (error) {
      console.error(`❌ Error setting ${layerId} visibility to ${visibility}${context ? ` (${context})` : ''}:`, error);
      performanceMonitor.measure(`visibility-${layerId}`);
      return false;
    }
  }

  /**
   * Set layer visibility with retry logic and verification
   * Requirements: 2.2, 2.3 - Retry failed operations up to 3 attempts with verification
   */
  private async setVisibilityWithRetry(
    layerId: string, 
    visibility: 'visible' | 'none', 
    context: string, 
    maxRetries: number
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Set the visibility immediately (not debounced for verification)
        if (this.map && this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', visibility);
          
          // Verify the change was applied successfully
          const verificationResult = await verifyLayerVisibility(
            this.map, 
            layerId, 
            visibility, 
            { 
              timeout: 100, // 100ms max as per requirements
              context: `${context} - attempt ${attempt}` 
            }
          );
          
          if (verificationResult.success) {
            if (attempt > 1) {
              console.log(`✅ Layer visibility for ${layerId} succeeded on attempt ${attempt}${context ? ` (${context})` : ''}`);
            }
            return true;
          } else {
            console.warn(`⚠️ Layer visibility verification failed for ${layerId} on attempt ${attempt}: ${verificationResult.error}${context ? ` (${context})` : ''}`);
            
            // If this is not the last attempt, wait a bit before retrying
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay between retries
            }
          }
        } else {
          console.error(`❌ Layer ${layerId} not available for visibility change on attempt ${attempt}${context ? ` (${context})` : ''}`);
          return false;
        }
      } catch (error) {
        console.error(`❌ Error setting ${layerId} visibility on attempt ${attempt}:`, error, `${context ? ` (${context})` : ''}`);
        
        // If this is not the last attempt, wait a bit before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay between retries
        }
      }
    }
    
    // All retries failed
    console.error(`❌ Failed to set ${layerId} visibility to ${visibility} after ${maxRetries} attempts${context ? ` (${context})` : ''}`);
    return false;
  }

  /**
   * Optimized property setter with batching
   */
  setLayerProperty(layerId: string, property: string, value: any, type: 'layout' | 'paint' = 'layout'): boolean {
    if (!this.map) {
      console.warn(`⚠️ Map not available for layer property change: ${layerId}.${property}`);
      return false;
    }

    performanceMonitor.mark(`property-${layerId}-${property}`);

    try {
      if (!this.map.getLayer(layerId)) {
        console.warn(`⚠️ Layer ${layerId} not found when trying to set property ${property}`);
        return false;
      }

      // Use throttled update for performance during rapid changes
      this.throttledPropertyUpdate(layerId, property, value, type);
      
      const duration = performanceMonitor.measure(`property-${layerId}-${property}`);
      if (duration > 100) {
        console.warn(`⚠️ Layer property change for ${layerId}.${property} took ${duration.toFixed(2)}ms (target: <100ms)`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Error setting ${layerId} property ${property}:`, error);
      performanceMonitor.measure(`property-${layerId}-${property}`);
      return false;
    }
  }

  /**
   * Process batched visibility updates
   */
  private processBatchedVisibilityUpdates(updates: Array<{
    layerId: string;
    visibility: 'visible' | 'none';
    context?: string;
  }>): void {
    if (!this.map) return;

    performanceMonitor.mark('batch-visibility-update');

    try {
      // Group updates by visibility to optimize map operations
      const visibleLayers: string[] = [];
      const hiddenLayers: string[] = [];

      for (const update of updates) {
        if (update.visibility === 'visible') {
          visibleLayers.push(update.layerId);
        } else {
          hiddenLayers.push(update.layerId);
        }
      }

      // Apply visibility changes in batches
      for (const layerId of visibleLayers) {
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
      }

      for (const layerId of hiddenLayers) {
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', 'none');
        }
      }

      const duration = performanceMonitor.measure('batch-visibility-update');
      console.log(`✅ Batched visibility update for ${updates.length} layers completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Error in batched visibility update:', error);
      performanceMonitor.measure('batch-visibility-update');
    }
  }

  /**
   * Process batched property updates
   */
  private processBatchedPropertyUpdates(updates: Array<{
    layerId: string;
    property: string;
    value: any;
    type: 'layout' | 'paint';
  }>): void {
    if (!this.map) return;

    performanceMonitor.mark('batch-property-update');

    try {
      // Group updates by layer and type for optimization
      const layoutUpdates = new Map<string, Array<{ property: string; value: any }>>();
      const paintUpdates = new Map<string, Array<{ property: string; value: any }>>();

      for (const update of updates) {
        const targetMap = update.type === 'layout' ? layoutUpdates : paintUpdates;
        
        if (!targetMap.has(update.layerId)) {
          targetMap.set(update.layerId, []);
        }
        
        targetMap.get(update.layerId)!.push({
          property: update.property,
          value: update.value
        });
      }

      // Apply layout property updates
      layoutUpdates.forEach((properties, layerId) => {
        if (this.map && this.map.getLayer(layerId)) {
          for (const { property, value } of properties) {
            this.map.setLayoutProperty(layerId, property, value);
          }
        }
      });

      // Apply paint property updates
      paintUpdates.forEach((properties, layerId) => {
        if (this.map && this.map.getLayer(layerId)) {
          for (const { property, value } of properties) {
            this.map.setPaintProperty(layerId, property, value);
          }
        }
      });

      const duration = performanceMonitor.measure('batch-property-update');
      console.log(`✅ Batched property update for ${updates.length} properties completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Error in batched property update:', error);
      performanceMonitor.measure('batch-property-update');
    }
  }

  /**
   * Flush all pending batched operations
   */
  flush(): void {
    this.visibilityBatch.flush();
    this.propertyBatch.flush();
  }

  /**
   * Clear all pending operations
   */
  clear(): void {
    this.visibilityBatch.clear();
    this.propertyBatch.clear();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): Record<string, any> {
    return {
      visibility: performanceMonitor.getAllStats(),
      queueSizes: {
        visibility: this.visibilityBatch.getQueueSize(),
        properties: this.propertyBatch.getQueueSize()
      }
    };
  }
}

/**
 * Optimized zoom-responsive configuration manager
 */
export class ZoomOptimizedConfigManager {
  private static readonly ZOOM_CONFIGS = {
    // Optimized zoom stops for better performance
    textSize: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 10,   // Minimal size for overview
      8, 12,   // Readable at country level
      10, 14,  // Good for regional view
      12, 16,  // Clear for detailed view
      14, 18,  // Large for close inspection
      16, 20   // Maximum for very close view
    ],
    
    symbolSpacing: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 400,  // Sparse for overview
      10, 300, // Moderate spacing
      12, 250, // Closer labels
      14, 200, // Denser labels
      16, 150  // Densest for detailed view
    ],
    
    textPadding: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 4,    // Minimal padding
      10, 6,   // Moderate padding
      14, 8,   // Generous padding
      16, 10   // Maximum padding
    ],
    
    textHaloWidth: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 2.0,  // Subtle halo
      10, 2.5, // Moderate halo
      14, 3.0, // Strong halo
      16, 3.5  // Maximum contrast
    ],
    
    textOpacity: [
      'interpolate',
      ['linear'],
      ['zoom'],
      5, 0.6,  // Subtle for overview
      8, 0.8,  // More visible
      10, 0.9, // Clear
      12, 1.0  // Fully visible
    ]
  };

  /**
   * Get optimized zoom-responsive configuration
   */
  static getZoomConfig(property: keyof typeof ZoomOptimizedConfigManager.ZOOM_CONFIGS): any[] {
    return ZoomOptimizedConfigManager.ZOOM_CONFIGS[property];
  }

  /**
   * Get all zoom configurations for layer creation
   */
  static getAllZoomConfigs(): Record<string, any[]> {
    return { ...ZoomOptimizedConfigManager.ZOOM_CONFIGS };
  }
}

/**
 * Memory-efficient feature processing utility
 */
export class FeatureProcessor {
  private static readonly MAX_FEATURES_PER_BATCH = 1000;
  private static readonly PROCESSING_DELAY = 16; // ~60fps

  /**
   * Process large feature datasets in batches to prevent blocking
   */
  static async processFeaturesBatched<T, R>(
    features: T[],
    processor: (feature: T) => R,
    onProgress?: (processed: number, total: number) => void
  ): Promise<R[]> {
    const results: R[] = [];
    const total = features.length;
    
    performanceMonitor.mark('feature-processing');

    for (let i = 0; i < features.length; i += this.MAX_FEATURES_PER_BATCH) {
      const batch = features.slice(i, i + this.MAX_FEATURES_PER_BATCH);
      
      // Process batch
      const batchResults = batch.map(processor);
      results.push(...batchResults);
      
      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + this.MAX_FEATURES_PER_BATCH, total), total);
      }
      
      // Yield control to prevent blocking
      if (i + this.MAX_FEATURES_PER_BATCH < features.length) {
        await new Promise(resolve => setTimeout(resolve, this.PROCESSING_DELAY));
      }
    }

    const duration = performanceMonitor.measure('feature-processing');
    console.log(`✅ Processed ${total} features in ${duration.toFixed(2)}ms`);

    return results;
  }

  /**
   * Validate and filter features efficiently
   */
  static validateFeatures(features: any[]): any[] {
    performanceMonitor.mark('feature-validation');

    const validFeatures = features.filter(feature => {
      // Quick validation checks
      if (!feature || typeof feature !== 'object') return false;
      if (!feature.properties || typeof feature.properties !== 'object') return false;
      if (!feature.geometry || typeof feature.geometry !== 'object') return false;
      
      // Check for required properties
      const props = feature.properties;
      if (!props.itineraryId && !props.id) return false;
      
      return true;
    });

    const duration = performanceMonitor.measure('feature-validation');
    const filteredCount = features.length - validFeatures.length;
    
    if (filteredCount > 0) {
      console.log(`✅ Filtered ${filteredCount} invalid features in ${duration.toFixed(2)}ms`);
    }

    return validFeatures;
  }
}

/**
 * Global optimized layer manager instance
 */
export const optimizedLayerManager = new OptimizedLayerManager();