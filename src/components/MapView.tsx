import React, { Component, createRef } from 'react';
import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules,
} from 'react-native';
import {
  MapViewProps,
  LatLng,
  MapMethodResult,
} from '../types';

const COMPONENT_NAME = 'BaiduMapView';
const RNBaiduMapView = requireNativeComponent(COMPONENT_NAME);
const { BaiduMapModule } = NativeModules;

export interface MapViewMethods {
  /**
   * 设置地图中心点
   */
  setCenter(coordinate: LatLng, animated?: boolean): Promise<MapMethodResult>;
  
  /**
   * 设置地图缩放级别
   */
  setZoom(zoom: number, animated?: boolean): Promise<MapMethodResult>;
  
  /**
   * 设置地图显示区域
   */
  setRegion(
    center: LatLng,
    latitudeDelta: number,
    longitudeDelta: number,
    animated?: boolean
  ): Promise<MapMethodResult>;
  
  /**
   * 获取当前地图状态
   */
  getMapStatus(): Promise<MapMethodResult<{
    center: LatLng;
    zoom: number;
    overlook: number;
    rotation: number;
  }>>;
  
  /**
   * 截取地图快照
   */
  takeSnapshot(): Promise<MapMethodResult<string>>;
  
  /**
   * 清除地图缓存
   */
  clearCache(): Promise<MapMethodResult>;
}

export interface MapViewState {
  isMapLoaded: boolean;
}

export class MapView extends Component<MapViewProps, MapViewState> implements MapViewMethods {
  private mapRef = createRef<any>();
  
  constructor(props: MapViewProps) {
    super(props);
    this.state = {
      isMapLoaded: false,
    };
  }

  componentDidMount() {
    // 确保百度地图SDK已初始化
    this.ensureSDKInitialized();
  }

  private async ensureSDKInitialized(): Promise<void> {
    try {
      if (BaiduMapModule && BaiduMapModule.isSDKInitialized) {
        const isInitialized = await BaiduMapModule.isSDKInitialized();
        if (!isInitialized) {
          console.warn('BaiduMap SDK is not initialized. Please call BaiduMapModule.initialize() first.');
        }
      }
    } catch (error) {
      console.error('Failed to check SDK initialization status:', error);
    }
  }

  private getMapHandle(): number | null {
    const nodeHandle = findNodeHandle(this.mapRef.current);
    return nodeHandle;
  }

  private async callMapMethod(method: string, params: any = {}): Promise<MapMethodResult> {
    const handle = this.getMapHandle();
    if (!handle) {
      return {
        success: false,
        error: {
          code: 'INVALID_PARAMETER' as any,
          message: 'Map view not found',
        },
      };
    }

    try {
      if (BaiduMapModule && BaiduMapModule[method]) {
        const result = await BaiduMapModule[method](handle, params);
        return result;
      } else {
        return {
          success: false,
          error: {
            code: 'UNKNOWN_ERROR' as any,
            message: `Method ${method} not found`,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR' as any,
          message: error instanceof Error ? error.message : 'Unknown error',
          nativeError: error,
        },
      };
    }
  }

  // MapViewMethods 实现
  async setCenter(coordinate: LatLng, animated: boolean = true): Promise<MapMethodResult> {
    return this.callMapMethod('setCenter', { coordinate, animated });
  }

  async setZoom(zoom: number, animated: boolean = true): Promise<MapMethodResult> {
    return this.callMapMethod('setZoom', { zoom, animated });
  }

  async setRegion(
    center: LatLng,
    latitudeDelta: number,
    longitudeDelta: number,
    animated: boolean = true
  ): Promise<MapMethodResult> {
    return this.callMapMethod('setRegion', {
      center,
      latitudeDelta,
      longitudeDelta,
      animated,
    });
  }

  async getMapStatus(): Promise<MapMethodResult<{
    center: LatLng;
    zoom: number;
    overlook: number;
    rotation: number;
  }>> {
    return this.callMapMethod('getMapStatus');
  }

  async takeSnapshot(): Promise<MapMethodResult<string>> {
    return this.callMapMethod('takeSnapshot');
  }

  async clearCache(): Promise<MapMethodResult> {
    return this.callMapMethod('clearCache');
  }

  // 事件处理方法 - 暂时注释掉，因为原生组件不支持这些属性
  // private handleMapClick = (event: { nativeEvent: MapClickEvent }) => {
  //   const { onMapClick } = this.props;
  //   if (onMapClick) {
  //     onMapClick(event.nativeEvent);
  //   }
  // };

  // private handleMapLongClick = (event: { nativeEvent: MapLongClickEvent }) => {
  //   const { onMapLongClick } = this.props;
  //   if (onMapLongClick) {
  //     onMapLongClick(event.nativeEvent);
  //   }
  // };

  // private handleMapStatusChange = (event: { nativeEvent: MapStatusChangeEvent }) => {
  //   const { onMapStatusChange } = this.props;
  //   if (onMapStatusChange) {
  //     onMapStatusChange(event.nativeEvent);
  //   }
  // };

  // private handleMapLoaded = () => {
  //   this.setState({ isMapLoaded: true });
  //   const { onMapLoaded } = this.props;
  //   if (onMapLoaded) {
  //     onMapLoaded();
  //   }
  // };

  render() {
    const {
      center,
      zoom = 10,
      mapType = 'normal',
      showsUserLocation = false,
      userLocationAccuracyCircleEnabled = true,
      showsCompass = true,
      showsScale = true,
      zoomControlsEnabled = true,
      scrollGesturesEnabled = true,
      zoomGesturesEnabled = true,
      rotateGesturesEnabled = true,
      overlookEnabled = true,
      buildingsEnabled = true,
      trafficEnabled = false,
      baiduHeatMapEnabled = false,
      children,
      // 事件处理器已在上面处理，这里不需要传递给原生组件
      onMapClick,
      onMapLongClick,
      onMapStatusChange,
      onMapLoaded,
      ...otherProps
    } = this.props;

    return (
      <RNBaiduMapView
        ref={this.mapRef}
        {...otherProps}
      >
        {children}
      </RNBaiduMapView>
    );
  }
}

export default MapView;