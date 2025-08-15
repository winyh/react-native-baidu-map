import { PerformanceOptimizer } from '../../src/utils/PerformanceOptimizer';
import { LatLng } from '../../src/types';

describe('PerformanceOptimizer', () => {
  beforeEach(() => {
    PerformanceOptimizer.cleanup();
  });

  describe('Marker clustering', () => {
    const createTestMarkers = (count: number): Array<{ id: number; coordinate: LatLng; title: string }> => {
      const markers = [];
      for (let i = 0; i < count; i++) {
        markers.push({
          id: i + 1,
          coordinate: {
            latitude: 39.915 + (Math.random() - 0.5) * 0.1,
            longitude: 116.404 + (Math.random() - 0.5) * 0.1,
          },
          title: `Marker ${i + 1}`,
        });
      }
      return markers;
    };

    it('should cluster nearby markers', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.915, longitude: 116.404 }, title: 'Marker 1' },
        { id: 2, coordinate: { latitude: 39.916, longitude: 116.405 }, title: 'Marker 2' },
        { id: 3, coordinate: { latitude: 39.917, longitude: 116.406 }, title: 'Marker 3' },
        { id: 4, coordinate: { latitude: 39.925, longitude: 116.414 }, title: 'Marker 4' },
      ];

      const clusters = PerformanceOptimizer.clusterMarkers(markers, 12, 100);

      expect(clusters.length).toBeLessThan(markers.length);
      
      // Should have at least one cluster
      const clusterFound = clusters.some(cluster => cluster.isCluster && cluster.count > 1);
      expect(clusterFound).toBe(true);
    });

    it('should not cluster distant markers', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.915, longitude: 116.404 }, title: 'Beijing' },
        { id: 2, coordinate: { latitude: 31.235, longitude: 121.505 }, title: 'Shanghai' },
        { id: 3, coordinate: { latitude: 22.543, longitude: 114.057 }, title: 'Shenzhen' },
      ];

      const clusters = PerformanceOptimizer.clusterMarkers(markers, 5, 50);

      // All markers should remain separate at low zoom level
      expect(clusters.length).toBe(markers.length);
      clusters.forEach(cluster => {
        expect(cluster.isCluster).toBe(false);
        expect(cluster.markers.length).toBe(1);
      });
    });

    it('should adjust clustering based on zoom level', () => {
      const markers = createTestMarkers(20);

      const lowZoomClusters = PerformanceOptimizer.clusterMarkers(markers, 8, 100);
      const highZoomClusters = PerformanceOptimizer.clusterMarkers(markers, 15, 100);

      // Lower zoom should result in more clustering
      expect(lowZoomClusters.length).toBeLessThanOrEqual(highZoomClusters.length);
    });

    it('should handle empty marker array', () => {
      const clusters = PerformanceOptimizer.clusterMarkers([], 12, 100);
      expect(clusters).toEqual([]);
    });

    it('should handle single marker', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.915, longitude: 116.404 }, title: 'Single Marker' },
      ];

      const clusters = PerformanceOptimizer.clusterMarkers(markers, 12, 100);

      expect(clusters.length).toBe(1);
      expect(clusters[0].isCluster).toBe(false);
      expect(clusters[0].markers.length).toBe(1);
    });

    it('should calculate cluster center correctly', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.910, longitude: 116.400 }, title: 'Marker 1' },
        { id: 2, coordinate: { latitude: 39.920, longitude: 116.410 }, title: 'Marker 2' },
      ];

      const clusters = PerformanceOptimizer.clusterMarkers(markers, 12, 200);

      if (clusters.length === 1 && clusters[0].isCluster) {
        const cluster = clusters[0];
        expect(cluster.coordinate.latitude).toBeCloseTo(39.915, 3);
        expect(cluster.coordinate.longitude).toBeCloseTo(116.405, 3);
      }
    });

    it('should handle different cluster radius values', () => {
      const markers = createTestMarkers(10);

      const smallRadiusClusters = PerformanceOptimizer.clusterMarkers(markers, 12, 20);
      const largeRadiusClusters = PerformanceOptimizer.clusterMarkers(markers, 12, 200);

      // Larger radius should result in fewer clusters
      expect(largeRadiusClusters.length).toBeLessThanOrEqual(smallRadiusClusters.length);
    });
  });

  describe('Memory management', () => {
    it('should track memory usage', () => {
      const initialMemory = PerformanceOptimizer.getMemoryUsage();
      expect(typeof initialMemory.used).toBe('number');
      expect(typeof initialMemory.total).toBe('number');
      expect(initialMemory.used).toBeGreaterThanOrEqual(0);
      expect(initialMemory.total).toBeGreaterThan(0);
    });

    it('should cleanup resources', () => {
      // Add some data to track
      const markers = createTestMarkers(100);
      PerformanceOptimizer.clusterMarkers(markers, 12, 100);

      // Cleanup should not throw
      expect(() => {
        PerformanceOptimizer.cleanup();
      }).not.toThrow();
    });

    it('should handle multiple cleanup calls', () => {
      expect(() => {
        PerformanceOptimizer.cleanup();
        PerformanceOptimizer.cleanup();
        PerformanceOptimizer.cleanup();
      }).not.toThrow();
    });
  });

  describe('Performance monitoring', () => {
    it('should measure clustering performance', () => {
      const markers = createTestMarkers(1000);
      
      const startTime = Date.now();
      const clusters = PerformanceOptimizer.clusterMarkers(markers, 12, 100);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // Clustering should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(clusters.length).toBeGreaterThan(0);
    });

    it('should handle large datasets efficiently', () => {
      const largeMarkerSet = createTestMarkers(5000);
      
      const startTime = Date.now();
      const clusters = PerformanceOptimizer.clusterMarkers(largeMarkerSet, 10, 50);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // Should still complete within reasonable time even with large dataset
      expect(duration).toBeLessThan(5000);
      expect(clusters.length).toBeLessThan(largeMarkerSet.length);
    });
  });

  describe('Debouncing', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = PerformanceOptimizer.debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(100);

      // Function should be called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    it('should reset debounce timer on new calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = PerformanceOptimizer.debounce(mockFn, 100);

      debouncedFn('first');
      jest.advanceTimersByTime(50);
      
      debouncedFn('second');
      jest.advanceTimersByTime(50);
      
      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      
      // Now function should be called
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });

    it('should handle immediate execution option', () => {
      const mockFn = jest.fn();
      const debouncedFn = PerformanceOptimizer.debounce(mockFn, 100, true);

      debouncedFn('immediate');

      // Function should be called immediately
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('immediate');

      // Subsequent calls should be debounced
      debouncedFn('debounced');
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Throttling', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = PerformanceOptimizer.throttle(mockFn, 100);

      // First call should execute immediately
      throttledFn('first');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      // Subsequent calls within throttle period should be ignored
      throttledFn('second');
      throttledFn('third');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // After throttle period, next call should execute
      jest.advanceTimersByTime(100);
      throttledFn('fourth');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('fourth');
    });

    it('should handle rapid successive calls', () => {
      const mockFn = jest.fn();
      const throttledFn = PerformanceOptimizer.throttle(mockFn, 50);

      // Make many rapid calls
      for (let i = 0; i < 10; i++) {
        throttledFn(`call-${i}`);
        jest.advanceTimersByTime(10);
      }

      // Should have been called multiple times but not for every call
      expect(mockFn.mock.calls.length).toBeGreaterThan(1);
      expect(mockFn.mock.calls.length).toBeLessThan(10);
    });
  });

  describe('Viewport optimization', () => {
    it('should filter markers within viewport', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.915, longitude: 116.404 }, title: 'Inside' },
        { id: 2, coordinate: { latitude: 40.015, longitude: 116.504 }, title: 'Outside' },
        { id: 3, coordinate: { latitude: 39.925, longitude: 116.414 }, title: 'Inside' },
      ];

      const viewport = {
        northeast: { latitude: 39.95, longitude: 116.45 },
        southwest: { latitude: 39.90, longitude: 116.35 },
      };

      const visibleMarkers = PerformanceOptimizer.filterMarkersInViewport(markers, viewport);

      expect(visibleMarkers.length).toBe(2);
      expect(visibleMarkers.map(m => m.title)).toEqual(['Inside', 'Inside']);
    });

    it('should handle edge cases in viewport filtering', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.90, longitude: 116.35 }, title: 'Southwest corner' },
        { id: 2, coordinate: { latitude: 39.95, longitude: 116.45 }, title: 'Northeast corner' },
        { id: 3, coordinate: { latitude: 39.925, longitude: 116.40 }, title: 'Center' },
      ];

      const viewport = {
        northeast: { latitude: 39.95, longitude: 116.45 },
        southwest: { latitude: 39.90, longitude: 116.35 },
      };

      const visibleMarkers = PerformanceOptimizer.filterMarkersInViewport(markers, viewport);

      // All markers should be visible (including boundary markers)
      expect(visibleMarkers.length).toBe(3);
    });

    it('should handle empty viewport', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.915, longitude: 116.404 }, title: 'Marker' },
      ];

      const viewport = {
        northeast: { latitude: 39.90, longitude: 116.35 },
        southwest: { latitude: 39.95, longitude: 116.45 },
      };

      // Invalid viewport (northeast is southwest of southwest)
      const visibleMarkers = PerformanceOptimizer.filterMarkersInViewport(markers, viewport);

      expect(visibleMarkers.length).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid marker data gracefully', () => {
      const invalidMarkers = [
        { id: 1, coordinate: null, title: 'Invalid' },
        { id: 2, coordinate: { latitude: 'invalid', longitude: 116.404 }, title: 'Invalid' },
        { id: 3, coordinate: { latitude: 39.915, longitude: 116.404 }, title: 'Valid' },
      ] as any;

      expect(() => {
        const clusters = PerformanceOptimizer.clusterMarkers(invalidMarkers, 12, 100);
        expect(Array.isArray(clusters)).toBe(true);
      }).not.toThrow();
    });

    it('should handle extreme coordinate values', () => {
      const extremeMarkers = [
        { id: 1, coordinate: { latitude: 90, longitude: 180 }, title: 'North Pole' },
        { id: 2, coordinate: { latitude: -90, longitude: -180 }, title: 'South Pole' },
        { id: 3, coordinate: { latitude: 0, longitude: 0 }, title: 'Equator' },
      ];

      expect(() => {
        const clusters = PerformanceOptimizer.clusterMarkers(extremeMarkers, 1, 1000);
        expect(Array.isArray(clusters)).toBe(true);
      }).not.toThrow();
    });

    it('should handle negative zoom levels', () => {
      const markers = [
        { id: 1, coordinate: { latitude: 39.915, longitude: 116.404 }, title: 'Marker' },
      ];

      expect(() => {
        const clusters = PerformanceOptimizer.clusterMarkers(markers, -5, 100);
        expect(Array.isArray(clusters)).toBe(true);
      }).not.toThrow();
    });
  });
});