import React, { Component } from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { PolylineProps, LatLng } from '../types';

const COMPONENT_NAME = 'BaiduMapPolyline';
const RNBaiduMapPolyline = requireNativeComponent(COMPONENT_NAME);

export interface PolylineComponentProps extends PolylineProps {
  style?: ViewStyle;
  onPress?: () => void;
}

export class Polyline extends Component<PolylineComponentProps> {
  static defaultProps: Partial<PolylineComponentProps> = {
    color: '#FF0000',
    width: 5,
    dottedLine: false,
    zIndex: 0,
    visible: true,
  };

  private handlePress = () => {
    const { onPress } = this.props;
    if (onPress) {
      onPress();
    }
  };

  render() {
    const {
      style,
      coordinates,
      color,
      width,
      dottedLine,
      zIndex,
      visible,
      onPress,
      ...otherProps
    } = this.props;

    if (!coordinates || coordinates.length < 2) {
      console.warn('Polyline: coordinates prop must contain at least 2 points');
      return null;
    }

    return (
      <RNBaiduMapPolyline
        style={style}
        coordinates={coordinates}
        color={color}
        width={width}
        dottedLine={dottedLine}
        zIndex={zIndex}
        visible={visible}
        onPress={this.handlePress}
        {...otherProps}
      />
    );
  }
}

export default Polyline;