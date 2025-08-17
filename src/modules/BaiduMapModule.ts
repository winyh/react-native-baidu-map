import { NativeModules } from 'react-native';
import {
  BaiduMapConfig,
  ErrorCode,
  CoordinateType,
  CoordinateConvertResult,
  LatLng,
} from '../types';

const { BaiduMapModule: NativeBaiduMapModule } = NativeModules;

export class BaiduMapModule {
  private static isInitialized: boolean = false;
  private static config: BaiduMapConfig | null = null;

  /**
   * 初始化百度地图SDK
   */
  static async initialize(config: BaiduMapConfig): Promise<void> {
    if (!NativeBaiduMapModule) {
      throw Object.assign(new Error('原生百度地图模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (!config.apiKey) {
      throw Object.assign(new Error('API Key 不能为空'), {
        code: ErrorCode.INIT_INVALID_API_KEY,
      });
    }

    try {
      await NativeBaiduMapModule.initSDK(config.apiKey);
      this.isInitialized = true;
      this.config = config;
    } catch (error) {
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * 检查SDK是否已初始化
   */
  static async isSDKInitialized(): Promise<boolean> {
    if (!NativeBaiduMapModule) {
      return false;
    }
    try {
      return await NativeBaiduMapModule.isSDKInitialized();
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取SDK版本信息
   */
  static async getSDKVersion(): Promise<string> {
    if (!NativeBaiduMapModule) {
      throw Object.assign(new Error('原生百度地图模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }
    return await NativeBaiduMapModule.getSDKVersion();
  }

  /**
   * 坐标转换
   */
  static async convertCoordinate(
    coordinate: LatLng,
    from: CoordinateType,
    to: CoordinateType
  ): Promise<LatLng> {
    if (!NativeBaiduMapModule) {
      throw Object.assign(new Error('原生百度地图模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (from === to) {
      return coordinate;
    }

    return await NativeBaiduMapModule.convertCoordinate(coordinate, from, to);
  }

  /**
   * 批量坐标转换
   */
  static async convertCoordinates(
    coordinates: LatLng[],
    from: CoordinateType,
    to: CoordinateType
  ): Promise<LatLng[]> {
    if (!NativeBaiduMapModule) {
      throw Object.assign(new Error('原生百度地图模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (from === to) {
      return coordinates;
    }

    return await NativeBaiduMapModule.convertCoordinates(coordinates, from, to);
  }

  /**
   * 清除地图缓存
   */
  static async clearMapCache(): Promise<void> {
    if (!NativeBaiduMapModule) {
      throw Object.assign(new Error('原生百度地图模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }
    await NativeBaiduMapModule.clearMapCache();
  }

  /**
   * 设置用户协议确认状态
   */
  static async setAgreePrivacy(agree: boolean): Promise<void> {
    if (!NativeBaiduMapModule) {
      throw Object.assign(new Error('原生百度地图模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }
    await NativeBaiduMapModule.setAgreePrivacy(agree);
  }

  /**
   * 获取当前配置
   */
  static getConfig(): BaiduMapConfig | null {
    return this.config;
  }

  /**
   * 检查是否已初始化（同步方法）
   */
  static getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  /**
   * 地图截图
   */
  static async takeSnapshot(options: any): Promise<any> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.takeSnapshot(options);
  }

  /**
   * 设置地图自定义样式
   */
  static async setMapCustomStyle(styleOptions: any): Promise<any> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.setMapCustomStyle(styleOptions);
  }

  /**
   * 添加热力图
   */
  static async addHeatMap(dataPoints: any[], options: any): Promise<any> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.addHeatMap(dataPoints, options);
  }

  /**
   * 移除热力图
   */
  static async removeHeatMap(): Promise<any> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.removeHeatMap();
  }

  /**
   * 地图动画移动到指定位置
   */
  static async animateToLocation(options: {
    latitude: number;
    longitude: number;
    duration: number;
  }): Promise<void> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.animateToLocation(options);
  }

  /**
   * 地图动画缩放到指定级别
   */
  static async animateToZoom(options: {
    zoomLevel: number;
    duration: number;
  }): Promise<void> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.animateToZoom(options);
  }

  /**
   * 下载离线地图
   */
  static async downloadOfflineMap(options: {
    cityId: string;
    cityName: string;
  }): Promise<{success: boolean, message: string}> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.downloadOfflineMap(options);
  }

  /**
   * 获取离线地图列表
   */
  static async getOfflineMapList(): Promise<Array<{cityId: string, cityName: string, status: string}>> {
    if (!NativeBaiduMapModule) {
      throw new Error('原生百度地图模块未找到');
    }
    return await NativeBaiduMapModule.getOfflineMapList();
  }
}

export default BaiduMapModule;
