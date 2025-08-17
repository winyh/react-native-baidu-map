import React, { Component, createRef } from 'react';
import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules,
} from 'react-native';
import {
  MapViewProps,
  LatLng,
  BaiduMapErrorCode,
} from '../types';

const COMPONENT_NAME = 'BaiduMapView';
const RNBaiduMapView = requireNativeComponent(COMPONENT_NAME);
const { BaiduMapModule } = NativeModules;

export interface MapViewMethods {
  setCenter(coordinate: LatLng, animated?: boolean): Promise<void>;
  setZoom(zoom: number, animated?: boolean): Promise<void>;
  setRegion(
    center: LatLng,
    latitudeDelta: number,
    longitudeDelta: number,
    animated?: boolean
  ): Promise<void>;
  getMapStatus(): Promise<{
    center: LatLng;
    zoom: number;
    overlook: number;
    rotation: number;
  }>;
  takeSnapshot(): Promise<{ uri: string; path: string }>;
  clearCache(): Promise<void>;
}

export class MapView extends Component<MapViewProps> implements MapViewMethods {
  private mapRef = createRef<any>();

  private getMapHandle(): number | null {
    return findNodeHandle(this.mapRef.current);
  }

  private async callMapMethod(method: string, params: any[] = []): Promise<any> {
    const handle = this.getMapHandle();
    if (handle === null) {
      throw Object.assign(new Error('MapView not found'), {
        code: BaiduMapErrorCode.GENERAL_INTERNAL_ERROR,
      });
    }

    if (BaiduMapModule && BaiduMapModule[method]) {
      return await BaiduMapModule[method](handle, ...params);
    } else {
      throw Object.assign(new Error(`Method ${method} not found in BaiduMapModule`),
        {
          code: BaiduMapErrorCode.GENERAL_INTERNAL_ERROR,
        }
      );
    }
  }

  async setCenter(coordinate: LatLng, animated: boolean = true): Promise<void> {
    await this.callMapMethod('setCenter', [coordinate, animated]);
  }

  async setZoom(zoom: number, animated: boolean = true): Promise<void> {
    await this.callMapMethod('setZoom', [zoom, animated]);
  }

  async setRegion(
    center: LatLng,
    latitudeDelta: number,
    longitudeDelta: number,
    animated: boolean = true
  ): Promise<void> {
    await this.callMapMethod('setRegion', [center, latitudeDelta, longitudeDelta, animated]);
  }

  async getMapStatus(): Promise<{
    center: LatLng;
    zoom: number;
    overlook: number;
    rotation: number;
  }> {
    return await this.callMapMethod('getMapStatus');
  }

  async takeSnapshot(): Promise<{ uri: string; path: string }> {
    return await this.callMapMethod('takeSnapshot');
  }

  async clearCache(): Promise<void> {
    await this.callMapMethod('clearCache');
  }

  render() {
    return <RNBaiduMapView ref={this.mapRef} {...this.props} />;
  }
}

export default MapView;