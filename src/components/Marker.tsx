import React, { Component } from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import {
  MarkerProps,
  MarkerClickEvent,
  MarkerDragEvent,
} from '../types';

const COMPONENT_NAME = 'BaiduMapMarker';
const RNBaiduMapMarker = requireNativeComponent(COMPONENT_NAME);

export interface MarkerComponentProps extends MarkerProps {
  style?: ViewStyle;
  onPress?: (event: MarkerClickEvent) => void;
  onDragStart?: (event: MarkerDragEvent) => void;
  onDrag?: (event: MarkerDragEvent) => void;
  onDragEnd?: (event: MarkerDragEvent) => void;
  children?: React.ReactNode;
}

export class Marker extends Component<MarkerComponentProps> {
  static defaultProps: Partial<MarkerComponentProps> = {
    draggable: false,
    visible: true,
    zIndex: 0,
    alpha: 1.0,
    rotation: 0,
    flat: false,
    anchor: { x: 0.5, y: 1.0 }, // 默认锚点在底部中心
  };

  // private handlePress = (event: { nativeEvent: MarkerClickEvent }) => {
  //   const { onPress } = this.props;
  //   if (onPress) {
  //     onPress(event.nativeEvent);
  //   }
  // };

  // private handleDragStart = (event: { nativeEvent: MarkerDragEvent }) => {
  //   const { onDragStart } = this.props;
  //   if (onDragStart) {
  //     onDragStart(event.nativeEvent);
  //   }
  // };

  // private handleDrag = (event: { nativeEvent: MarkerDragEvent }) => {
  //   const { onDrag } = this.props;
  //   if (onDrag) {
  //     onDrag(event.nativeEvent);
  //   }
  // };

  // private handleDragEnd = (event: { nativeEvent: MarkerDragEvent }) => {
  //   const { onDragEnd } = this.props;
  //   if (onDragEnd) {
  //     onDragEnd(event.nativeEvent);
  //   }
  // };

  render() {
    const {
      style,
      coordinate,
      title,
      description,
      icon,
      draggable,
      visible,
      zIndex,
      alpha,
      rotation,
      flat,
      anchor,
      children,
      // 事件处理器
      onPress,
      onDragStart,
      onDrag,
      onDragEnd,
      ...otherProps
    } = this.props;

    if (!coordinate) {
      console.warn('Marker: coordinate prop is required');
      return null;
    }

    return (
      <RNBaiduMapMarker
        {...otherProps}
      >
        {children}
      </RNBaiduMapMarker>
    );
  }
}

export default Marker;