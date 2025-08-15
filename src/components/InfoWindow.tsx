import React, { Component } from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';
import { InfoWindowProps } from '../types';

const COMPONENT_NAME = 'BaiduMapInfoWindow';
const RNBaiduMapInfoWindow = requireNativeComponent(COMPONENT_NAME);

export interface InfoWindowComponentProps extends InfoWindowProps {
  style?: ViewStyle;
  onPress?: () => void;
  children?: React.ReactNode;
}

export class InfoWindow extends Component<InfoWindowComponentProps> {
  static defaultProps: Partial<InfoWindowComponentProps> = {
    visible: true,
    yOffset: 0,
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
      coordinate,
      visible,
      yOffset,
      children,
      onPress,
      ...otherProps
    } = this.props;

    if (!coordinate) {
      console.warn('InfoWindow: coordinate prop is required');
      return null;
    }

    return (
      <RNBaiduMapInfoWindow
        {...otherProps}
      >
        {children}
      </RNBaiduMapInfoWindow>
    );
  }
}

export default InfoWindow;