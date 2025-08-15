import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import {
  LocationResult,
  LocationOptions,
  BaiduMapError,
  BaiduMapErrorCode,
  LocationMode,
  CoordinateType,
  PermissionStatus,
  PermissionResult,
  MapMethodResult,
} from '../types';

const { BaiduMapModule } = NativeModules;

export class LocationModule {
  private static watchId: number = 0;
  private static watchCallbacks: Map<number, (location: LocationResult | BaiduMapError) => void> = new Map();

  /**
   * 检查定位权限状态
   */
  static async checkLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return { status: PermissionStatus.GRANTED, canRequestAgain: false };
    }

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (granted) {
        return { status: PermissionStatus.GRANTED, canRequestAgain: false };
      }

      // 检查是否可以请求权限
      // 注意：shouldShowRequestPermissionRationale 在某些版本中可能不可用
      let canRequest = true;
      try {
        // @ts-ignore - 方法可能不存在于类型定义中
        if (PermissionsAndroid.shouldShowRequestPermissionRationale) {
          // @ts-ignore
          canRequest = await PermissionsAndroid.shouldShowRequestPermissionRationale(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
        }
      } catch (error) {
        // 如果方法不存在，假设可以请求权限
        canRequest = true;
      }

      return {
        status: PermissionStatus.DENIED,
        canRequestAgain: !canRequest, // shouldShowRequestPermissionRationale 返回 false 表示用户选择了"不再询问"
      };
    } catch (error) {
      return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
    }
  }

  /**
   * 请求定位权限
   */
  static async requestLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return { status: PermissionStatus.GRANTED, canRequestAgain: false };
    }

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '定位权限',
          message: '应用需要访问您的位置信息以提供地图服务',
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        }
      );

      switch (result) {
        case PermissionsAndroid.RESULTS.GRANTED:
          return { status: PermissionStatus.GRANTED, canRequestAgain: false };
        case PermissionsAndroid.RESULTS.DENIED:
          return { status: PermissionStatus.DENIED, canRequestAgain: true };
        case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
          return { status: PermissionStatus.NEVER_ASK_AGAIN, canRequestAgain: false };
        default:
          return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
      }
    } catch (error) {
      return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
    }
  }

  /**
   * 获取当前位置（单次定位）
   */
  static async getCurrentLocation(options?: LocationOptions): Promise<LocationResult> {
    // 检查权限
    const permissionResult = await this.checkLocationPermission();
    if (permissionResult.status !== PermissionStatus.GRANTED) {
      throw {
        code: BaiduMapErrorCode.LOCATION_PERMISSION_DENIED,
        message: '定位权限被拒绝',
      } as BaiduMapError;
    }

    // 检查SDK是否初始化
    if (!BaiduMapModule) {
      throw {
        code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
        message: '百度地图SDK未初始化',
      } as BaiduMapError;
    }

    try {
      const locationOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
        needAddress: true,
        needLocationDescribe: true,
        needLocationPoiList: false,
        ...options,
      };

      const result = await BaiduMapModule.getCurrentLocation(locationOptions);
      
      if (result.success) {
        return result.data as LocationResult;
      } else {
        throw result.error as BaiduMapError;
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error as BaiduMapError;
      }
      
      throw {
        code: BaiduMapErrorCode.UNKNOWN_ERROR,
        message: error instanceof Error ? error.message : '获取位置失败',
        nativeError: error,
      } as BaiduMapError;
    }
  }

  /**
   * 开始监听位置变化（连续定位）
   */
  static watchPosition(
    successCallback: (location: LocationResult) => void,
    errorCallback?: (error: BaiduMapError) => void,
    options?: LocationOptions
  ): number {
    const watchId = ++this.watchId;

    // 创建回调函数
    const callback = (result: LocationResult | BaiduMapError) => {
      if ('code' in result) {
        // 这是一个错误
        if (errorCallback) {
          errorCallback(result as BaiduMapError);
        }
      } else {
        // 这是一个成功的位置结果
        successCallback(result as LocationResult);
      }
    };

    this.watchCallbacks.set(watchId, callback);

    // 启动位置监听
    this.startWatchingPosition(watchId, options);

    return watchId;
  }

  /**
   * 停止监听位置变化
   */
  static clearWatch(watchId: number): void {
    if (this.watchCallbacks.has(watchId)) {
      this.watchCallbacks.delete(watchId);
      
      if (BaiduMapModule && BaiduMapModule.stopLocationUpdates) {
        BaiduMapModule.stopLocationUpdates(watchId);
      }
    }
  }

  /**
   * 停止所有位置监听
   */
  static clearAllWatches(): void {
    this.watchCallbacks.clear();
    
    if (BaiduMapModule && BaiduMapModule.stopAllLocationUpdates) {
      BaiduMapModule.stopAllLocationUpdates();
    }
  }

  /**
   * 启动位置监听的私有方法
   */
  private static async startWatchingPosition(watchId: number, options?: LocationOptions): Promise<void> {
    try {
      // 检查权限
      const permissionResult = await this.checkLocationPermission();
      if (permissionResult.status !== PermissionStatus.GRANTED) {
        const callback = this.watchCallbacks.get(watchId);
        if (callback) {
          callback({
            code: BaiduMapErrorCode.LOCATION_PERMISSION_DENIED,
            message: '定位权限被拒绝',
          } as BaiduMapError);
        }
        return;
      }

      if (!BaiduMapModule) {
        const callback = this.watchCallbacks.get(watchId);
        if (callback) {
          callback({
            code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
            message: '百度地图SDK未初始化',
          } as BaiduMapError);
        }
        return;
      }

      const locationOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
        interval: 5000,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
        needAddress: true,
        needLocationDescribe: true,
        needLocationPoiList: false,
        ...options,
      };

      // 启动连续定位
      await BaiduMapModule.startLocationUpdates(watchId, locationOptions);
    } catch (error) {
      const callback = this.watchCallbacks.get(watchId);
      if (callback) {
        callback({
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '启动位置监听失败',
          nativeError: error,
        } as BaiduMapError);
      }
    }
  }

  /**
   * 处理来自原生模块的位置更新回调
   * 这个方法应该被原生模块调用
   */
  static handleLocationUpdate(watchId: number, result: LocationResult | BaiduMapError): void {
    const callback = this.watchCallbacks.get(watchId);
    if (callback) {
      callback(result);
    }
  }

  /**
   * 检查定位服务是否可用
   */
  static async isLocationServiceEnabled(): Promise<boolean> {
    if (!BaiduMapModule) {
      return false;
    }

    try {
      const result = await BaiduMapModule.isLocationServiceEnabled();
      return result.success && result.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取定位配置信息
   */
  static async getLocationConfig(): Promise<MapMethodResult<{
    locationMode: LocationMode;
    coordinateType: CoordinateType;
    interval: number;
    needAddress: boolean;
  }>> {
    if (!BaiduMapModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '百度地图SDK未初始化',
        },
      };
    }

    try {
      return await BaiduMapModule.getLocationConfig();
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '获取定位配置失败',
          nativeError: error,
        },
      };
    }
  }
}

export default LocationModule;