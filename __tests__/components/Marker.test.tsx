import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Marker } from '../../src/components/Marker';

jest.mock('react-native', () => ({
  requireNativeComponent: jest.fn(() => 'MockedMarker'),
  Image: {
    resolveAssetSource: jest.fn((source) => ({ uri: source })),
  },
}));

describe('Marker Component', () => {
  const defaultCoordinate = { latitude: 39.915, longitude: 116.404 };

  it('renders correctly with required props', () => {
    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
      />
    );

    const marker = getByTestId('marker');
    expect(marker).toBeTruthy();
    expect(marker.props.coordinate).toEqual(defaultCoordinate);
  });

  it('renders with title and description', () => {
    const title = 'Test Marker';
    const description = 'This is a test marker';

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        title={title}
        description={description}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.title).toBe(title);
    expect(marker.props.description).toBe(description);
  });

  it('handles custom icon', () => {
    const customIcon = require('../../assets/custom-marker.png');

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        icon={customIcon}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.icon).toEqual(customIcon);
  });

  it('handles draggable property', () => {
    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        draggable={true}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.draggable).toBe(true);
  });

  it('handles visibility property', () => {
    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        visible={false}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.visible).toBe(false);
  });

  it('handles zIndex property', () => {
    const zIndex = 10;

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        zIndex={zIndex}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.zIndex).toBe(zIndex);
  });

  it('handles anchor property', () => {
    const anchor = { x: 0.5, y: 0.5 };

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        anchor={anchor}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.anchor).toEqual(anchor);
  });

  it('handles rotation property', () => {
    const rotation = 45;

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        rotation={rotation}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.rotation).toBe(rotation);
  });

  it('handles alpha property', () => {
    const alpha = 0.5;

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        alpha={alpha}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.alpha).toBe(alpha);
  });

  it('handles flat property', () => {
    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        flat={true}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.flat).toBe(true);
  });

  it('handles press events', async () => {
    const onPress = jest.fn();

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        onPress={onPress}
      />
    );

    const marker = getByTestId('marker');
    fireEvent(marker, 'onPress');

    await waitFor(() => {
      expect(onPress).toHaveBeenCalled();
    });
  });

  it('handles drag start events', async () => {
    const onDragStart = jest.fn();
    const dragCoordinate = { latitude: 39.916, longitude: 116.405 };

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        draggable={true}
        onDragStart={onDragStart}
      />
    );

    const marker = getByTestId('marker');
    fireEvent(marker, 'onDragStart', { nativeEvent: { coordinate: dragCoordinate } });

    await waitFor(() => {
      expect(onDragStart).toHaveBeenCalledWith(dragCoordinate);
    });
  });

  it('handles drag events', async () => {
    const onDrag = jest.fn();
    const dragCoordinate = { latitude: 39.916, longitude: 116.405 };

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        draggable={true}
        onDrag={onDrag}
      />
    );

    const marker = getByTestId('marker');
    fireEvent(marker, 'onDrag', { nativeEvent: { coordinate: dragCoordinate } });

    await waitFor(() => {
      expect(onDrag).toHaveBeenCalledWith(dragCoordinate);
    });
  });

  it('handles drag end events', async () => {
    const onDragEnd = jest.fn();
    const dragCoordinate = { latitude: 39.916, longitude: 116.405 };

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        draggable={true}
        onDragEnd={onDragEnd}
      />
    );

    const marker = getByTestId('marker');
    fireEvent(marker, 'onDragEnd', { nativeEvent: { coordinate: dragCoordinate } });

    await waitFor(() => {
      expect(onDragEnd).toHaveBeenCalledWith(dragCoordinate);
    });
  });

  it('handles callout press events', async () => {
    const onCalloutPress = jest.fn();

    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
        title="Test Marker"
        onCalloutPress={onCalloutPress}
      />
    );

    const marker = getByTestId('marker');
    fireEvent(marker, 'onCalloutPress');

    await waitFor(() => {
      expect(onCalloutPress).toHaveBeenCalled();
    });
  });

  it('renders custom children', () => {
    const { getByTestId, getByText } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
      >
        <div data-testid="custom-marker">Custom Marker Content</div>
      </Marker>
    );

    expect(getByTestId('marker')).toBeTruthy();
    expect(getByTestId('custom-marker')).toBeTruthy();
    expect(getByText('Custom Marker Content')).toBeTruthy();
  });

  it('applies default props correctly', () => {
    const { getByTestId } = render(
      <Marker
        testID="marker"
        coordinate={defaultCoordinate}
      />
    );

    const marker = getByTestId('marker');
    expect(marker.props.draggable).toBe(false);
    expect(marker.props.visible).toBe(true);
    expect(marker.props.zIndex).toBe(0);
    expect(marker.props.anchor).toEqual({ x: 0.5, y: 1.0 });
    expect(marker.props.rotation).toBe(0);
    expect(marker.props.alpha).toBe(1.0);
    expect(marker.props.flat).toBe(false);
    expect(marker.props.perspective).toBe(true);
  });
});