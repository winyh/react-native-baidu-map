import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MapView } from '../../src/components/MapView';
import { BaiduMapModule } from '../../src/modules/BaiduMapModule';
import { MapType, LocationMode, CoordinateType } from '../../src/types';

// Mock native modules
jest.mock('../../src/modules/BaiduMapModule', () => ({
  initialize: jest.fn(),
  setAgreePrivacy: jest.fn(),
  getVersion: jest.fn(),
  isInitialized: jest.fn(),
}));

jest.mock('react-native', () => ({
  requireNativeComponent: jest.fn(() => 'MockedMapView'),
  NativeModules: {
    BaiduMapModule: {
      initialize: jest.fn(),
      setAgreePrivacy: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('MapView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (BaiduMapModule.isInitialized as jest.Mock).mockResolvedValue(true);
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
      />
    );

    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('renders with custom center and zoom', () => {
    const center = { latitude: 39.915, longitude: 116.404 };
    const zoom = 15;

    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        center={center}
        zoom={zoom}
      />
    );

    const mapView = getByTestId('map-view');
    expect(mapView).toBeTruthy();
    expect(mapView.props.center).toEqual(center);
    expect(mapView.props.zoom).toBe(zoom);
  });

  it('handles different map types', () => {
    const mapTypes = [MapType.NORMAL, MapType.SATELLITE, MapType.HYBRID];

    mapTypes.forEach((mapType) => {
      const { getByTestId } = render(
        <MapView
          testID="map-view"
          style={{ flex: 1 }}
          mapType={mapType}
        />
      );

      const mapView = getByTestId('map-view');
      expect(mapView.props.mapType).toBe(mapType);
    });
  });

  it('handles map click events', async () => {
    const onMapClick = jest.fn();
    const clickCoordinate = { latitude: 39.915, longitude: 116.404 };

    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        onMapClick={onMapClick}
      />
    );

    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'onMapClick', { nativeEvent: { coordinate: clickCoordinate } });

    await waitFor(() => {
      expect(onMapClick).toHaveBeenCalledWith(clickCoordinate);
    });
  });

  it('handles map long click events', async () => {
    const onMapLongClick = jest.fn();
    const clickCoordinate = { latitude: 39.915, longitude: 116.404 };

    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        onMapLongClick={onMapLongClick}
      />
    );

    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'onMapLongClick', { nativeEvent: { coordinate: clickCoordinate } });

    await waitFor(() => {
      expect(onMapLongClick).toHaveBeenCalledWith(clickCoordinate);
    });
  });

  it('handles map status change events', async () => {
    const onMapStatusChange = jest.fn();
    const mapStatus = {
      center: { latitude: 39.915, longitude: 116.404 },
      zoom: 12,
      rotation: 0,
      overlook: 0,
    };

    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        onMapStatusChange={onMapStatusChange}
      />
    );

    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'onMapStatusChange', { nativeEvent: mapStatus });

    await waitFor(() => {
      expect(onMapStatusChange).toHaveBeenCalledWith(mapStatus);
    });
  });

  it('handles map loaded event', async () => {
    const onMapLoaded = jest.fn();

    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        onMapLoaded={onMapLoaded}
      />
    );

    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'onMapLoaded');

    await waitFor(() => {
      expect(onMapLoaded).toHaveBeenCalled();
    });
  });

  it('handles user location update events', async () => {
    const onUserLocationUpdate = jest.fn();
    const locationResult = {
      latitude: 39.915,
      longitude: 116.404,
      accuracy: 10,
      timestamp: Date.now(),
      address: '北京市',
    };

    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        showsUserLocation={true}
        onUserLocationUpdate={onUserLocationUpdate}
      />
    );

    const mapView = getByTestId('map-view');
    fireEvent(mapView, 'onUserLocationUpdate', { nativeEvent: locationResult });

    await waitFor(() => {
      expect(onUserLocationUpdate).toHaveBeenCalledWith(locationResult);
    });
  });

  it('applies correct props for user location display', () => {
    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        showsUserLocation={true}
        userLocationAccuracyCircleEnabled={false}
      />
    );

    const mapView = getByTestId('map-view');
    expect(mapView.props.showsUserLocation).toBe(true);
    expect(mapView.props.userLocationAccuracyCircleEnabled).toBe(false);
  });

  it('applies correct props for map controls', () => {
    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        showsCompass={true}
        showsScale={true}
        zoomControlsEnabled={false}
      />
    );

    const mapView = getByTestId('map-view');
    expect(mapView.props.showsCompass).toBe(true);
    expect(mapView.props.showsScale).toBe(true);
    expect(mapView.props.zoomControlsEnabled).toBe(false);
  });

  it('applies correct props for map interaction', () => {
    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        overlookEnabled={false}
      />
    );

    const mapView = getByTestId('map-view');
    expect(mapView.props.scrollEnabled).toBe(false);
    expect(mapView.props.zoomEnabled).toBe(false);
    expect(mapView.props.rotateEnabled).toBe(false);
    expect(mapView.props.overlookEnabled).toBe(false);
  });

  it('renders children components correctly', () => {
    const { getByTestId } = render(
      <MapView
        testID="map-view"
        style={{ flex: 1 }}
      >
        <MockMarker testID="marker-1" />
        <MockPolyline testID="polyline-1" />
      </MapView>
    );

    expect(getByTestId('map-view')).toBeTruthy();
    expect(getByTestId('marker-1')).toBeTruthy();
    expect(getByTestId('polyline-1')).toBeTruthy();
  });

  describe('Snapshot Tests', () => {
    it('renders correctly with default props', () => {
      const { toJSON } = render(<MapView style={{ flex: 1 }} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with custom center and zoom', () => {
      const center = { latitude: 39.915, longitude: 116.404 };
      const zoom = 15;
      const { toJSON } = render(<MapView style={{ flex: 1 }} center={center} zoom={zoom} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with satellite map type', () => {
      const { toJSON } = render(<MapView style={{ flex: 1 }} mapType={MapType.SATELLITE} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with user location enabled', () => {
      const { toJSON } = render(<MapView style={{ flex: 1 }} showsUserLocation />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders with some controls disabled', () => {
      const { toJSON } = render(
        <MapView
          style={{ flex: 1 }}
          showsCompass={false}
          zoomControlsEnabled={false}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

// Mock components for testing
const MockMarker = ({ testID }: { testID: string }) => <div data-testid={testID} />;
const MockPolyline = ({ testID }: { testID: string }) => <div data-testid={testID} />;