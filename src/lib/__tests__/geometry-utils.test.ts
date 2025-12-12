import * as fc from 'fast-check';
import { calculateItineraryBounds, Geometry, GeometryType } from '../geometry-utils';

describe('Geometry Bounds Calculation', () => {
  
  // **Feature: itinerary-zoom-button, Property 6: Geometry type handling**
  // **Validates: Requirements 2.2**
  describe('Property 6: Geometry type handling', () => {
    
    // Generator for valid longitude values (-180 to 180) - exclude NaN and Infinity
    const longitudeArb = fc.double({ min: -180, max: 180, noNaN: true });
    
    // Generator for valid latitude values (-90 to 90) - exclude NaN and Infinity
    const latitudeArb = fc.double({ min: -90, max: 90, noNaN: true });
    
    // Generator for coordinate pairs [lng, lat]
    const coordinateArb = fc.tuple(longitudeArb, latitudeArb);
    
    // Generator for Point geometry
    const pointGeometryArb = fc.record({
      type: fc.constant('Point' as const),
      coordinates: coordinateArb
    });
    
    // Generator for LineString geometry (at least 2 coordinates)
    const lineStringGeometryArb = fc.record({
      type: fc.constant('LineString' as const),
      coordinates: fc.array(coordinateArb, { minLength: 2, maxLength: 20 })
    });
    
    // Generator for MultiLineString geometry (at least 1 line with at least 2 coordinates each)
    const multiLineStringGeometryArb = fc.record({
      type: fc.constant('MultiLineString' as const),
      coordinates: fc.array(
        fc.array(coordinateArb, { minLength: 2, maxLength: 10 }),
        { minLength: 1, maxLength: 5 }
      )
    });
    
    // Generator for any valid geometry type
    const validGeometryArb = fc.oneof(
      pointGeometryArb,
      lineStringGeometryArb,
      multiLineStringGeometryArb
    );

    test('should handle Point geometry correctly', () => {
      fc.assert(
        fc.property(
          pointGeometryArb,
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds
            expect(bounds).not.toBeNull();
            expect(bounds).toHaveLength(2);
            expect(bounds![0]).toHaveLength(2);
            expect(bounds![1]).toHaveLength(2);
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            const [originalLng, originalLat] = geometry.coordinates;
            
            // For a point, bounds should be centered around the point with padding
            expect(minLng).toBeLessThanOrEqual(originalLng);
            expect(maxLng).toBeGreaterThanOrEqual(originalLng);
            expect(minLat).toBeLessThanOrEqual(originalLat);
            expect(maxLat).toBeGreaterThanOrEqual(originalLat);
            
            // Bounds should be valid (min < max)
            expect(minLng).toBeLessThan(maxLng);
            expect(minLat).toBeLessThan(maxLat);
            
            // Point should be within the bounds
            expect(originalLng).toBeGreaterThanOrEqual(minLng);
            expect(originalLng).toBeLessThanOrEqual(maxLng);
            expect(originalLat).toBeGreaterThanOrEqual(minLat);
            expect(originalLat).toBeLessThanOrEqual(maxLat);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle LineString geometry correctly', () => {
      fc.assert(
        fc.property(
          lineStringGeometryArb,
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds
            expect(bounds).not.toBeNull();
            expect(bounds).toHaveLength(2);
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            
            // Calculate expected bounds from coordinates
            const lngs = geometry.coordinates.map(coord => coord[0]);
            const lats = geometry.coordinates.map(coord => coord[1]);
            const expectedMinLng = Math.min(...lngs);
            const expectedMaxLng = Math.max(...lngs);
            const expectedMinLat = Math.min(...lats);
            const expectedMaxLat = Math.max(...lats);
            
            // All original coordinates should be within the calculated bounds (accounting for padding)
            geometry.coordinates.forEach(([lng, lat]) => {
              expect(lng).toBeGreaterThanOrEqual(minLng);
              expect(lng).toBeLessThanOrEqual(maxLng);
              expect(lat).toBeGreaterThanOrEqual(minLat);
              expect(lat).toBeLessThanOrEqual(maxLat);
            });
            
            // Bounds should include padding (bounds should be larger than or equal to the actual coordinate range)
            expect(minLng).toBeLessThanOrEqual(expectedMinLng);
            expect(maxLng).toBeGreaterThanOrEqual(expectedMaxLng);
            expect(minLat).toBeLessThanOrEqual(expectedMinLat);
            expect(maxLat).toBeGreaterThanOrEqual(expectedMaxLat);
            
            // Bounds should be valid (min < max)
            expect(minLng).toBeLessThan(maxLng);
            expect(minLat).toBeLessThan(maxLat);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle MultiLineString geometry correctly', () => {
      fc.assert(
        fc.property(
          multiLineStringGeometryArb,
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds
            expect(bounds).not.toBeNull();
            expect(bounds).toHaveLength(2);
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            
            // Flatten all coordinates from all lines
            const allCoordinates = geometry.coordinates.flat();
            const lngs = allCoordinates.map(coord => coord[0]);
            const lats = allCoordinates.map(coord => coord[1]);
            const expectedMinLng = Math.min(...lngs);
            const expectedMaxLng = Math.max(...lngs);
            const expectedMinLat = Math.min(...lats);
            const expectedMaxLat = Math.max(...lats);
            
            // All original coordinates should be within the calculated bounds (accounting for padding)
            allCoordinates.forEach(([lng, lat]) => {
              expect(lng).toBeGreaterThanOrEqual(minLng);
              expect(lng).toBeLessThanOrEqual(maxLng);
              expect(lat).toBeGreaterThanOrEqual(minLat);
              expect(lat).toBeLessThanOrEqual(maxLat);
            });
            
            // Bounds should include padding (bounds should be larger than or equal to the actual coordinate range)
            expect(minLng).toBeLessThanOrEqual(expectedMinLng);
            expect(maxLng).toBeGreaterThanOrEqual(expectedMaxLng);
            expect(minLat).toBeLessThanOrEqual(expectedMinLat);
            expect(maxLat).toBeGreaterThanOrEqual(expectedMaxLat);
            
            // Bounds should be valid (min < max)
            expect(minLng).toBeLessThan(maxLng);
            expect(minLat).toBeLessThan(maxLat);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle all geometry types consistently', () => {
      fc.assert(
        fc.property(
          validGeometryArb,
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds for all supported geometry types
            expect(bounds).not.toBeNull();
            expect(bounds).toHaveLength(2);
            expect(bounds![0]).toHaveLength(2);
            expect(bounds![1]).toHaveLength(2);
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            
            // Bounds should be valid (min < max)
            expect(minLng).toBeLessThan(maxLng);
            expect(minLat).toBeLessThan(maxLat);
            
            // Bounds should be finite numbers
            expect(isFinite(minLng)).toBe(true);
            expect(isFinite(maxLng)).toBe(true);
            expect(isFinite(minLat)).toBe(true);
            expect(isFinite(maxLat)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should return null for invalid geometry', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.record({ type: fc.string(), coordinates: fc.constant(null) }),
            fc.record({ type: fc.string() }), // missing coordinates
            fc.record({ coordinates: coordinateArb }), // missing type
            fc.record({ type: fc.constant('Polygon'), coordinates: fc.array(coordinateArb) }) // unsupported type
          ),
          (invalidGeometry) => {
            const bounds = calculateItineraryBounds(invalidGeometry);
            expect(bounds).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: itinerary-zoom-button, Property 3: Zoom padding inclusion**
  // **Validates: Requirements 1.3**
  describe('Property 3: Zoom padding inclusion', () => {
    
    // Generator for valid longitude values (-180 to 180) - exclude NaN and Infinity
    const longitudeArb = fc.double({ min: -180, max: 180, noNaN: true });
    
    // Generator for valid latitude values (-90 to 90) - exclude NaN and Infinity
    const latitudeArb = fc.double({ min: -90, max: 90, noNaN: true });
    
    // Generator for coordinate pairs [lng, lat]
    const coordinateArb = fc.tuple(longitudeArb, latitudeArb);
    
    // Generator for LineString geometry with at least 2 different coordinates
    const lineStringWithRangeArb = fc.array(coordinateArb, { minLength: 2, maxLength: 20 })
      .filter(coords => {
        // Ensure we have at least some coordinate variation to test padding
        const lngs = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const latRange = Math.max(...lats) - Math.min(...lats);
        return lngRange > 0.001 || latRange > 0.001; // Some minimum variation
      })
      .map(coordinates => ({
        type: 'LineString' as const,
        coordinates
      }));
    
    // Generator for MultiLineString geometry with coordinate variation
    const multiLineStringWithRangeArb = fc.array(
      fc.array(coordinateArb, { minLength: 2, maxLength: 10 }),
      { minLength: 1, maxLength: 5 }
    )
      .filter(lines => {
        // Flatten all coordinates and check for variation
        const allCoords = lines.flat();
        const lngs = allCoords.map(c => c[0]);
        const lats = allCoords.map(c => c[1]);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const latRange = Math.max(...lats) - Math.min(...lats);
        return lngRange > 0.001 || latRange > 0.001; // Some minimum variation
      })
      .map(coordinates => ({
        type: 'MultiLineString' as const,
        coordinates
      }));

    test('should include appropriate padding for LineString geometries', () => {
      fc.assert(
        fc.property(
          lineStringWithRangeArb,
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds
            expect(bounds).not.toBeNull();
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            
            // Calculate the actual coordinate range
            const lngs = geometry.coordinates.map(coord => coord[0]);
            const lats = geometry.coordinates.map(coord => coord[1]);
            const actualMinLng = Math.min(...lngs);
            const actualMaxLng = Math.max(...lngs);
            const actualMinLat = Math.min(...lats);
            const actualMaxLat = Math.max(...lats);
            
            const actualLngRange = actualMaxLng - actualMinLng;
            const actualLatRange = actualMaxLat - actualMinLat;
            
            // Bounds should be larger than the actual coordinate range (padding included)
            const boundsLngRange = maxLng - minLng;
            const boundsLatRange = maxLat - minLat;
            
            expect(boundsLngRange).toBeGreaterThan(actualLngRange);
            expect(boundsLatRange).toBeGreaterThan(actualLatRange);
            
            // Calculate expected padding based on implementation logic
            const minPadding = 0.001;
            const expectedLngPadding = actualLngRange > 0 ? actualLngRange * 0.1 : minPadding;
            const expectedLatPadding = actualLatRange > 0 ? actualLatRange * 0.1 : minPadding;
            
            const actualLngPadding = (boundsLngRange - actualLngRange) / 2; // Padding on each side
            const actualLatPadding = (boundsLatRange - actualLatRange) / 2; // Padding on each side
            
            // Allow for small floating point differences
            expect(actualLngPadding).toBeCloseTo(expectedLngPadding, 10);
            expect(actualLatPadding).toBeCloseTo(expectedLatPadding, 10);
            
            // Verify that bounds extend beyond the actual coordinates (or equal for zero range)
            if (actualLngRange > 0) {
              expect(minLng).toBeLessThan(actualMinLng);
              expect(maxLng).toBeGreaterThan(actualMaxLng);
            } else {
              // For zero range, bounds should still be larger due to minimum padding
              expect(minLng).toBeLessThan(actualMinLng);
              expect(maxLng).toBeGreaterThan(actualMaxLng);
            }
            
            if (actualLatRange > 0) {
              expect(minLat).toBeLessThan(actualMinLat);
              expect(maxLat).toBeGreaterThan(actualMaxLat);
            } else {
              // For zero range, bounds should still be larger due to minimum padding
              expect(minLat).toBeLessThan(actualMinLat);
              expect(maxLat).toBeGreaterThan(actualMaxLat);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should include appropriate padding for MultiLineString geometries', () => {
      fc.assert(
        fc.property(
          multiLineStringWithRangeArb,
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds
            expect(bounds).not.toBeNull();
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            
            // Calculate the actual coordinate range from all lines
            const allCoordinates = geometry.coordinates.flat();
            const lngs = allCoordinates.map(coord => coord[0]);
            const lats = allCoordinates.map(coord => coord[1]);
            const actualMinLng = Math.min(...lngs);
            const actualMaxLng = Math.max(...lngs);
            const actualMinLat = Math.min(...lats);
            const actualMaxLat = Math.max(...lats);
            
            const actualLngRange = actualMaxLng - actualMinLng;
            const actualLatRange = actualMaxLat - actualMinLat;
            
            // Bounds should be larger than the actual coordinate range (padding included)
            const boundsLngRange = maxLng - minLng;
            const boundsLatRange = maxLat - minLat;
            
            expect(boundsLngRange).toBeGreaterThan(actualLngRange);
            expect(boundsLatRange).toBeGreaterThan(actualLatRange);
            
            // Calculate expected padding based on implementation logic
            const minPadding = 0.001;
            const expectedLngPadding = actualLngRange > 0 ? actualLngRange * 0.1 : minPadding;
            const expectedLatPadding = actualLatRange > 0 ? actualLatRange * 0.1 : minPadding;
            
            const actualLngPadding = (boundsLngRange - actualLngRange) / 2; // Padding on each side
            const actualLatPadding = (boundsLatRange - actualLatRange) / 2; // Padding on each side
            
            // Allow for small floating point differences
            expect(actualLngPadding).toBeCloseTo(expectedLngPadding, 10);
            expect(actualLatPadding).toBeCloseTo(expectedLatPadding, 10);
            
            // Verify that bounds extend beyond the actual coordinates (or equal for zero range)
            if (actualLngRange > 0) {
              expect(minLng).toBeLessThan(actualMinLng);
              expect(maxLng).toBeGreaterThan(actualMaxLng);
            } else {
              // For zero range, bounds should still be larger due to minimum padding
              expect(minLng).toBeLessThan(actualMinLng);
              expect(maxLng).toBeGreaterThan(actualMaxLng);
            }
            
            if (actualLatRange > 0) {
              expect(minLat).toBeLessThan(actualMinLat);
              expect(maxLat).toBeGreaterThan(actualMaxLat);
            } else {
              // For zero range, bounds should still be larger due to minimum padding
              expect(minLat).toBeLessThan(actualMinLat);
              expect(maxLat).toBeGreaterThan(actualMaxLat);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should include minimum padding for Point geometries', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.constant('Point' as const),
            coordinates: fc.tuple(longitudeArb, latitudeArb)
          }),
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds
            expect(bounds).not.toBeNull();
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            const [originalLng, originalLat] = geometry.coordinates;
            
            // For a point, there's no range, so we should get minimum padding
            const boundsLngRange = maxLng - minLng;
            const boundsLatRange = maxLat - minLat;
            
            // Should have some padding (minimum padding of 0.001 * 2 = 0.002)
            expect(boundsLngRange).toBeGreaterThan(0);
            expect(boundsLatRange).toBeGreaterThan(0);
            expect(boundsLngRange).toBeCloseTo(0.002, 3); // 0.001 padding on each side
            expect(boundsLatRange).toBeCloseTo(0.002, 3); // 0.001 padding on each side
            
            // Point should be centered in the bounds
            const centerLng = (minLng + maxLng) / 2;
            const centerLat = (minLat + maxLat) / 2;
            expect(centerLng).toBeCloseTo(originalLng, 10);
            expect(centerLat).toBeCloseTo(originalLat, 10);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should include minimum padding for identical coordinates in LineString', () => {
      fc.assert(
        fc.property(
          fc.tuple(longitudeArb, latitudeArb).chain(coord => 
            fc.record({
              type: fc.constant('LineString' as const),
              coordinates: fc.array(fc.constant(coord), { minLength: 2, maxLength: 5 })
            })
          ),
          (geometry) => {
            const bounds = calculateItineraryBounds(geometry);
            
            // Should return valid bounds
            expect(bounds).not.toBeNull();
            
            const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
            
            // All coordinates are identical, so should get minimum padding
            const boundsLngRange = maxLng - minLng;
            const boundsLatRange = maxLat - minLat;
            
            // Should have minimum padding (0.001 * 2 = 0.002)
            expect(boundsLngRange).toBeCloseTo(0.002, 3);
            expect(boundsLatRange).toBeCloseTo(0.002, 3);
            
            // All original coordinates should be within bounds
            geometry.coordinates.forEach(([lng, lat]) => {
              expect(lng).toBeGreaterThanOrEqual(minLng);
              expect(lng).toBeLessThanOrEqual(maxLng);
              expect(lat).toBeGreaterThanOrEqual(minLat);
              expect(lat).toBeLessThanOrEqual(maxLat);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for specific edge cases
  describe('Unit tests for edge cases', () => {
    test('should handle single point correctly', () => {
      const geometry = {
        type: 'Point' as const,
        coordinates: [10.0, 20.0]
      };
      
      const bounds = calculateItineraryBounds(geometry);
      expect(bounds).not.toBeNull();
      
      const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
      
      // Point should be within bounds
      expect(10.0).toBeGreaterThanOrEqual(minLng);
      expect(10.0).toBeLessThanOrEqual(maxLng);
      expect(20.0).toBeGreaterThanOrEqual(minLat);
      expect(20.0).toBeLessThanOrEqual(maxLat);
      
      // Bounds should be valid (min < max)
      expect(minLng).toBeLessThan(maxLng);
      expect(minLat).toBeLessThan(maxLat);
    });

    test('should handle LineString with identical coordinates', () => {
      const geometry = {
        type: 'LineString' as const,
        coordinates: [[10.0, 20.0], [10.0, 20.0]]
      };
      
      const bounds = calculateItineraryBounds(geometry);
      expect(bounds).not.toBeNull();
      
      const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
      
      // Should still have valid bounds with padding
      expect(minLng).toBeLessThan(maxLng);
      expect(minLat).toBeLessThan(maxLat);
      
      // Original coordinates should be within bounds
      expect(10.0).toBeGreaterThanOrEqual(minLng);
      expect(10.0).toBeLessThanOrEqual(maxLng);
      expect(20.0).toBeGreaterThanOrEqual(minLat);
      expect(20.0).toBeLessThanOrEqual(maxLat);
    });

    test('should return null for empty coordinates', () => {
      const geometry = {
        type: 'LineString' as const,
        coordinates: []
      };
      
      const bounds = calculateItineraryBounds(geometry);
      expect(bounds).toBeNull();
    });

    test('should return null for null geometry', () => {
      const bounds = calculateItineraryBounds(null);
      expect(bounds).toBeNull();
    });

    test('should return null for undefined geometry', () => {
      const bounds = calculateItineraryBounds(undefined);
      expect(bounds).toBeNull();
    });

    test('should return null for geometry without coordinates', () => {
      const geometry = { type: 'Point' };
      const bounds = calculateItineraryBounds(geometry);
      expect(bounds).toBeNull();
    });

    test('should return null for unsupported geometry type', () => {
      const geometry = {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      };
      
      const bounds = calculateItineraryBounds(geometry);
      expect(bounds).toBeNull();
    });
  });
});