import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MapView, Marker, Polyline, Polygon } from '../../src';
import { BaiduMapModule } from '../../src/modules/BaiduMapModule';
import { LocationModule } from '../../src/modules/LocationModule';

// Mock native modules
jest.mock('../../src/modules/BaiduMapModule');
jest.mock('../../src/modules/LocationModule');
jest.mock('react-native', () => ({
  requireNativeComponent: jest.fn(() => 'MockedComponent'),
  NativeModules: {
    BaiduMapModule: {
      initialize: jest.fn(),
      setAgreePrivacy: jest.fn(),
    },
    LocationModule: {
      getCurrentLocation: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
  },
}));

const mockBaiduMapModule = BaiduMapModule as jest.Mocked<typeof BaiduMapModule>;
const mockLocationModule = LocationModule as jest.Mocked<typeof LocationModule>;

describe('Map Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBaiduMapModule.isInitialized.mockResolvedValue(true);
    mockBaiduMapModule.initialize.mockResolvedValue({ success: true });
  });

  describe('Map with Markers Integration', () => {
    it('should render map with multiple markers', async () => {
      const { getByTestId, getAllByTestId } = render(
        <MapView
          testID="integration-map"
          style={{ flex: 1 }}
          center={{ latitude: 39.915, longitude: 116.404 }}
          zoom={12}
        >
          <Marker
            testID="marker-1"
            coordinate={{ latitude: 39.915, longitude: 116.404 }}
            title="Marker 1"
          />
          <Marker
            testID="marker-2"
            coordinate={{ latitude: 39.925, longitude: 116.414 }}
            title="Marker 2"
          />
          <Marker
            testID="marker-3"
            coordinate={{ latitude: 39.935, longitude: 116.424 }}
            title="Marker 3"
          />
        </MapView>
      );

      expect(getByTestId('integration-map')).toBeTruthy();
      
      const markers = getAllByTestId(/marker-\d+/);
      expect(markers).toHaveLength(3);
    });

    it('should handle marker interactions within map', async () => {
      const onMarkerPress = jest.fn();
      const onMapClick = jest.fn();

      const { getByTestId } = render(
        <MapView
          testID="integration-map"
          style={{ flex: 1 }}
          onMapClick={onMapClick}
        >
          <Marker
            testID="interactive-marker"
            coordinate={{ latitude: 39.915, longitude: 116.404 }}
            title="Interactive Marker"
            onPress={onMarkerPress}
          />
        </MapView>
      );

      const marker = getByTestId('interactive-marker');
      fireEvent(marker, 'onPress');

      await waitFor(() => {
        expect(onMarkerPress).toHaveBeenCalled();
      });

      const map = getByTestId('integration-map');
      fireEvent(map, 'onMapClick', { 
        nativeEvent: { coordinate: { latitude: 39.920, longitude: 116.410 } } 
      });

      await waitFor(() => {
        expect(onMapClick).toHaveBeenCalledWith({ latitude: 39.920, longitude: 116.410 });
      });
    });
  });

  describe('Map with Overlays Integration', () => {
    it('should render map with polylines and polygons', () => {
      const polylineCoordinates = [
        { latitude: 39.915, longitude: 116.404 },
        { latitude: 39.925, longitude: 116.414 },
        { latitude: 39.935, longitude: 116.424 },
      ];

      const polygonCoordinates = [
        { latitude: 39.910, longitude: 116.400 },
        { latitude: 39.910, longitude: 116.420 },
        { latitude: 39.930, longitude: 116.420 },
        { latitude: 39.930, longitude: 116.400 },
      ];

      const { getByTestId } = render(
        <MapView
          testID="overlay-map"
          style={{ flex: 1 }}
        >
          <Polyline
            testID="test-polyline"
            coordinates={polylineCoordinates}
            color="#FF0000"
            width={3}
          />
          <Polygon
            testID="test-polygon"
            coordinates={polygonCoordinates}
            fillColor="rgba(0, 255, 0, 0.3)"
            strokeColor="#00FF00"
          />
        </MapView>
      );

      expect(getByTestId('overlay-map')).toBeTruthy();
      expect(getByTestId('test-polyline')).toBeTruthy();
      expect(getByTestId('test-polygon')).toBeTruthy();
    });

    it('should handle overlay interactions', async () => {
      const onPolylinePress = jest.fn();
      const onPolygonPress = jest.fn();

      const { getByTestId } = render(
        <MapView
          testID="interactive-overlay-map"
          style={{ flex: 1 }}
        >
          <Polyline
            testID="interactive-polyline"
            coordinates={[
              { latitude: 39.915, longitude: 116.404 },
              { latitude: 39.925, longitude: 116.414 },
            ]}
            onPress={onPolylinePress}
          />
          <Polygon
            testID="interactive-polygon"
            coordinates={[
              { latitude: 39.910, longitude: 116.400 },
              { latitude: 39.910, longitude: 116.420 },
              { latitude: 39.930, longitude: 116.420 },
            ]}
            onPress={onPolygonPress}
          />
        </MapView>
      );

      const polyline = getByTestId('interactive-polyline');
      fireEvent(polyline, 'onPress');

      const polygon = getByTestId('interactive-polygon');
      fireEvent(polygon, 'onPress');

      await waitFor(() => {
        expect(onPolylinePress).toHaveBeenCalled();
        expect(onPolygonPress).toHaveBeenCalled();
      });
    });
  });

  describe('Location Integration', () => {
    it('should integrate location services with map', async () => {
      const mockLocation = {
        latitude: 39.915,
        longitude: 116.404,
        accuracy: 10,
        timestamp: Date.now(),
        address: '北京市',
      };

      mockLocationModule.getCurrentLocation.mockResolvedValue(mockLocation);

      const onUserLocationUpdate = jest.fn();

      const { getByTestId } = render(
        <MapView
          testID="location-map"
          style={{ flex: 1 }}
          showsUserLocation={true}
          onUserLocationUpdate={onUserLocationUpdate}
        />
      );

      // Simulate location update
      const map = getByTestId('location-map');
      fireEvent(map, 'onUserLocationUpdate', { nativeEvent: mockLocation });

      await waitFor(() => {
        expect(onUserLocationUpdate).toHaveBeenCalledWith(mockLocation);
      });
    });

    it('should handle location watching integration', async () => {
      const mockWatchId = 123;
      const mockLocation = {
        latitude: 39.915,
        longitude: 116.404,
        accuracy: 10,
        timestamp: Date.now(),
      };

      mockLocationModule.watchPosition.mockReturnValue(mockWatchId);

      // Test location watching setup
      const watchId = LocationModule.watchPosition(
        (location) => {
          expect(location).toEqual(mockLocation);
        },
        (error) => {
          fail('Should not have error');
        },
        {
          enableHighAccuracy: true,
          interval: 1000,
        }
      );

      expect(watchId).toBe(mockWatchId);
      expect(mockLocationModule.watchPosition).toHaveBeenCalled();

      // Test clearing watch
      LocationModule.clearWatch(watchId);
      expect(mockLocationModule.clearWatch).toHaveBeenCalledWith(watchId);
    });
  });

  describe('SDK Initialization Integration', () => {
    it('should handle complete SDK initialization flow', async () => {
      mockBaiduMapModule.isInitialized.mockResolvedValue(false);
      mockBaiduMapModule.setAgreePrivacy.mockResolvedValue(undefined);
      mockBaiduMapModule.initialize.mockResolvedValue({ success: true });

      // Simulate initialization flow
      await BaiduMapModule.setAgreePrivacy(true);
      
      const isInitialized = await BaiduMapModule.isInitialized();
      expect(isInitialized).toBe(false);

      const result = await BaiduMapModule.initialize({
        apiKey: 'test-api-key',
        enableLocation: true,
      });

      expect(result.success).toBe(true);
      expect(mockBaiduMapModule.setAgreePrivacy).toHaveBeenCalledWith(true);
      expect(mockBaiduMapModule.initialize).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        enableLocation: true,
      });
    });

    it('should handle initialization failure gracefully', async () => {
      const initError = {
        success: false,
        error: {
          code: 101,
          message: 'Invalid API key',
        },
      };

      mockBaiduMapModule.initialize.mockResolvedValue(initError);

      const result = await BaiduMapModule.initialize({
        apiKey: 'invalid-key',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(101);
      expect(result.error?.message).toBe('Invalid API key');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle dynamic marker updates', async () => {
      const TestComponent = () => {
        const [markers, setMarkers] = React.useState([
          {
            id: 1,
            coordinate: { latitude: 39.915, longitude: 116.404 },
            title: 'Initial Marker',
          },
        ]);

        React.useEffect(() => {
          // Simulate adding markers after component mount
          setTimeout(() => {
            setMarkers(prev => [
              ...prev,
              {
                id: 2,
                coordinate: { latitude: 39.925, longitude: 116.414 },
                title: 'Dynamic Marker',
              },
            ]);
          }, 100);
        }, []);

        return (
          <MapView testID="dynamic-map" style={{ flex: 1 }}>
            {markers.map(marker => (
              <Marker
                key={marker.id}
                testID={`dynamic-marker-${marker.id}`}
                coordinate={marker.coordinate}
                title={marker.title}
              />
            ))}
          </MapView>
        );
      };

      const { getByTestId, queryByTestId } = render(<TestComponent />);

      expect(getByTestId('dynamic-map')).toBeTruthy();
      expect(getByTestId('dynamic-marker-1')).toBeTruthy();
      expect(queryByTestId('dynamic-marker-2')).toBeNull();

      // Wait for dynamic marker to be added
      await waitFor(() => {
        expect(getByTestId('dynamic-marker-2')).toBeTruthy();
      }, { timeout: 200 });
    });

    it('should handle map state changes with overlays', async () => {
      const onMapStatusChange = jest.fn();

      const { getByTestId } = render(
        <MapView
          testID="state-change-map"
          style={{ flex: 1 }}
          center={{ latitude: 39.915, longitude: 116.404 }}
          zoom={12}
          onMapStatusChange={onMapStatusChange}
        >
          <Marker
            testID="state-marker"
            coordinate={{ latitude: 39.915, longitude: 116.404 }}
          />
          <Polyline
            testID="state-polyline"
            coordinates={[
              { latitude: 39.915, longitude: 116.404 },
              { latitude: 39.925, longitude: 116.414 },
            ]}
          />
        </MapView>
      );

      const map = getByTestId('state-change-map');
      
      // Simulate map status change
      const newStatus = {
        center: { latitude: 39.920, longitude: 116.410 },
        zoom: 15,
        rotation: 0,
        overlook: 0,
      };

      fireEvent(map, 'onMapStatusChange', { nativeEvent: newStatus });

      await waitFor(() => {
        expect(onMapStatusChange).toHaveBeenCalledWith(newStatus);
      });

      // Verify overlays are still present
      expect(getByTestId('state-marker')).toBeTruthy();
      expect(getByTestId('state-polyline')).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle native module errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      mockBaiduMapModule.initialize.mockRejectedValue(new Error('Native module error'));

      try {
        await BaiduMapModule.initialize({ apiKey: 'test' });
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Native module error');
      }

      consoleError.mockRestore();
    });

    it('should handle location service errors', async () => {
      const locationError = new Error('Location service unavailable');
      mockLocationModule.getCurrentLocation.mockRejectedValue(locationError);

      try {
        await LocationModule.getCurrentLocation({});
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Location service unavailable');
      }
    });

    it('should handle component rendering errors', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      // Test with invalid props
      expect(() => {
        render(
          <MapView
            testID="error-map"
            style={{ flex: 1 }}
            center={null as any}
          />
        );
      }).not.toThrow();

      consoleError.mockRestore();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large numbers of markers efficiently', () => {
      const markers = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        coordinate: {
          latitude: 39.915 + (Math.random() - 0.5) * 0.1,
          longitude: 116.404 + (Math.random() - 0.5) * 0.1,
        },
        title: `Marker ${i}`,
      }));

      const startTime = Date.now();

      const { getByTestId } = render(
        <MapView testID="performance-map" style={{ flex: 1 }}>
          {markers.map(marker => (
            <Marker
              key={marker.id}
              testID={`perf-marker-${marker.id}`}
              coordinate={marker.coordinate}
              title={marker.title}
            />
          ))}
        </MapView>
      );

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      expect(getByTestId('performance-map')).toBeTruthy();
      
      // Rendering should complete within reasonable time
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle rapid prop updates', async () => {
      const TestComponent = () => {
        const [center, setCenter] = React.useState({ latitude: 39.915, longitude: 116.404 });
        const [zoom, setZoom] = React.useState(12);

        React.useEffect(() => {
          // Simulate rapid updates
          const interval = setInterval(() => {
            setCenter(prev => ({
              latitude: prev.latitude + 0.001,
              longitude: prev.longitude + 0.001,
            }));
            setZoom(prev => prev + 0.1);
          }, 10);

          setTimeout(() => clearInterval(interval), 100);

          return () => clearInterval(interval);
        }, []);

        return (
          <MapView
            testID="rapid-update-map"
            style={{ flex: 1 }}
            center={center}
            zoom={zoom}
          />
        );
      };

      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId('rapid-update-map')).toBeTruthy();

      // Wait for updates to complete
      await waitFor(() => {
        // Component should still be rendered after rapid updates
        expect(getByTestId('rapid-update-map')).toBeTruthy();
      }, { timeout: 200 });
    });
  });
});