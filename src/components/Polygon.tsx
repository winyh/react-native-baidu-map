import React, { Component } from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { PolygonProps } from '../types';

const COMPONENT_NAME = 'BaiduMapPolygon';
const RNBaiduMapPolygon = requireNativeComponent(COMPONENT_NAME);

export interface PolygonComponentProps extends PolygonProps {
  style?: ViewStyle;
  onPress?: () => void;
}

export class Polygon extends Component<PolygonComponentProps> {
  static defaultProps: Partial<PolygonComponentProps> = {
    strokeColor: '#FF0000',
    strokeWidth: 2,
    fillColor: '#FF000080', // 50% 透明度
    zIndex: 0,
    visible: true,
  };

  // private handlePress = () => {
  //   const { onPress } = this.props;
  //   if (onPress) {
  //     onPress();
  //   }
  // };

  render() {
    const {
      style,
      coordinates,
      strokeColor,
      strokeWidth,
      fillColor,
      zIndex,
      visible,
      onPress,
      ...otherProps
    } = this.props;

    if (!coordinates || coordinates.length < 3) {
      console.warn('Polygon: coordinates prop must contain at least 3 points');
      return null;
    }

    return (
      <RNBaiduMapPolygon
        {...otherProps}
      />
    );
  }
}

export default Polygon;