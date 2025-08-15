import { NativeModules } from 'react-native';
import {
  BaiduMapConfig,
  BaiduMapError,
  BaiduMapErrorCode,
  MapMethodResult,
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
  static async initialize(config: BaiduMapConfig): Promise<MapMethodResult> {
    if (!NativeBaiduMapModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '原生百度地图模块未找到',
        },
      };
    }

    if (!config.apiKey) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_API_KEY,
          message: 'API Key 不能为空',
        },
      };
    }

    try {
      const result = await NativeBaiduMapModule.initialize(config);
      
      if (result.success) {
        this.isInitialized = true;
        this.config = config;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '初始化失败',
          nativeError: error,
        },
      };
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
      const result = await NativeBaiduMapModule.isSDKInitialized();
      this.isInitialized = result.success && result.data;
      return this.isInitialized;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取SDK版本信息
   */
  static async getSDKVersion(): Promise<MapMethodResult<string>> {
    if (!NativeBaiduMapModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '原生百度地图模块未找到',
        },
      };
    }

    try {
      return await NativeBaiduMapModule.getSDKVersion();
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '获取SDK版本失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 坐标转换
   */
  static async convertCoordinate(
    coordinate: LatLng,
    from: CoordinateType,
    to: CoordinateType
  ): Promise<CoordinateConvertResult> {
    if (!NativeBaiduMapModule) {
      return {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        success: false,
        error: '原生百度地图模块未找到',
      };
    }

    if (from === to) {
      return {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        success: true,
      };
    }

    try {
      const result = await NativeBaiduMapModule.convertCoordinate(coordinate, from, to);
      
      if (result.success) {
        return {
          latitude: result.data.latitude,
          longitude: result.data.longitude,
          success: true,
        };
      } else {
        return {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          success: false,
          error: result.error?.message || '坐标转换失败',
        };
      }
    } catch (error) {
      return {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        success: false,
        error: error instanceof Error ? error.message : '坐标转换失败',
      };
    }
  }

  /**
   * 批量坐标转换
   */
  static async convertCoordinates(
    coordinates: LatLng[],
    from: CoordinateType,
    to: CoordinateType
  ): Promise<CoordinateConvertResult[]> {
    if (!NativeBaiduMapModule) {
      return coordinates.map(coord => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
        success: false,
        error: '原生百度地图模块未找到',
      }));
    }

    if (from === to) {
      return coordinates.map(coord => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
        success: true,
      }));
    }

    try {
      const result = await NativeBaiduMapModule.convertCoordinates(coordinates, from, to);
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map((coord: LatLng) => ({
          latitude: coord.latitude,
          longitude: coord.longitude,
          success: true,
        }));
      } else {
        return coordinates.map(coord => ({
          latitude: coord.latitude,
          longitude: coord.longitude,
          success: false,
          error: result.error?.message || '批量坐标转换失败',
        }));
      }
    } catch (error) {
      return coordinates.map(coord => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
        success: false,
        error: error instanceof Error ? error.message : '批量坐标转换失败',
      }));
    }
  }

  /**
   * 清除地图缓存
   */
  static async clearMapCache(): Promise<MapMethodResult> {
    if (!NativeBaiduMapModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '原生百度地图模块未找到',
        },
      };
    }

    try {
      return await NativeBaiduMapModule.clearMapCache();
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '清除缓存失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 设置用户协议确认状态
   */
  static async setAgreePrivacy(agree: boolean): Promise<MapMethodResult> {
    if (!NativeBaiduMapModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '原生百度地图模块未找到',
        },
      };
    }

    try {
      return await NativeBaiduMapModule.setAgreePrivacy(agree);
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '设置用户协议状态失败',
          nativeError: error,
        },
      };
    }
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
}

export default BaiduMapModule;
