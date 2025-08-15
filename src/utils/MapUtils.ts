import { BaiduMapModule } from '../modules/BaiduMapModule';
import { Logger } from './Logger';

export interface SnapshotOptions {
  format?: 'png' | 'jpg' | 'jpeg';
  quality?: number; // 0.0 - 1.0
  width?: number;
  height?: number;
}

export interface SnapshotResult {
  uri: string;
  path: string;
  width: number;
  height: number;
  format: string;
  message?: string;
}

export interface MapStyleOptions {
  styleId?: string;
  styleJson?: string;
}

export interface HeatMapDataPoint {
  latitude: number;
  longitude: number;
  weight?: number;
}

export interface HeatMapOptions {
  radius?: number;
  opacity?: number;
  gradient?: string[];
}

export interface HeatMapResult {
  success: boolean;
  message: string;
  dataPointsCount: number;
}

/**
 * 地图工具类 - 提供高级地图功能
 */
export class MapUtils {
  private static logger = Logger.getInstance();

  /**
   * 地图截图
   * 
   * @param options 截图选项
   * @returns Promise<SnapshotResult>
   * 
   * @example
   * ```typescript
   * import { MapUtils } from '@react-native/winyh-baidu-map';
   * 
   * const result = await MapUtils.takeSnapshot({
   *   format: 'png',
   *   quality: 0.8,
   *   width: 800,
   *   height: 600
   * });
   * 
   * console.log('截图保存路径:', result.path);
   * ```
   */
  static async takeSnapshot(options: SnapshotOptions = {}): Promise<SnapshotResult> {
    const logger = this.logger;
    
    try {
      logger.info('开始地图截图', options);
      
      // 验证参数
      const validatedOptions = this.validateSnapshotOptions(options);
      
      // 调用原生模块
      const result = await BaiduMapModule.takeSnapshot(validatedOptions);
      
      logger.info('地图截图成功', {
        uri: result.uri,
        size: `${result.width}x${result.height}`,
        format: result.format
      });
      
      return result;
      
    } catch (error: any) {
      logger.error('地图截图失败', error);
      throw new Error(`地图截图失败: ${error.message || error}`);
    }
  }

  /**
   * 设置地图自定义样式
   * 
   * @param styleOptions 样式选项
   * @returns Promise<{success: boolean, message: string}>
   * 
   * @example
   * ```typescript
   * // 使用预设样式ID
   * await MapUtils.setMapCustomStyle({
   *   styleId: 'midnight'
   * });
   * 
   * // 使用自定义样式JSON
   * await MapUtils.setMapCustomStyle({
   *   styleJson: JSON.stringify({
   *     "water": "#1e3c72",
   *     "land": "#2a5298"
   *   })
   * });
   * ```
   */
  static async setMapCustomStyle(styleOptions: MapStyleOptions): Promise<{success: boolean, message: string}> {
    const logger = this.logger;
    
    try {
      logger.info('设置地图自定义样式', styleOptions);
      
      if (!styleOptions.styleId && !styleOptions.styleJson) {
        throw new Error('必须提供 styleId 或 styleJson 参数');
      }
      
      const result = await BaiduMapModule.setMapCustomStyle(styleOptions);
      
      logger.info('地图样式设置成功', result);
      
      return result;
      
    } catch (error: any) {
      logger.error('设置地图样式失败', error);
      throw new Error(`设置地图样式失败: ${error.message || error}`);
    }
  }

  /**
   * 添加热力图
   * 
   * @param dataPoints 热力图数据点
   * @param options 热力图选项
   * @returns Promise<HeatMapResult>
   * 
   * @example
   * ```typescript
   * const dataPoints = [
   *   { latitude: 39.915, longitude: 116.404, weight: 1.0 },
   *   { latitude: 39.916, longitude: 116.405, weight: 0.8 },
   *   { latitude: 39.917, longitude: 116.406, weight: 1.2 }
   * ];
   * 
   * const result = await MapUtils.addHeatMap(dataPoints, {
   *   radius: 20,
   *   opacity: 0.6
   * });
   * 
   * console.log('热力图添加成功，数据点数量:', result.dataPointsCount);
   * ```
   */
  static async addHeatMap(dataPoints: HeatMapDataPoint[], options: HeatMapOptions = {}): Promise<HeatMapResult> {
    const logger = this.logger;
    
    try {
      logger.info('添加热力图', {
        dataPointsCount: dataPoints.length,
        options
      });
      
      // 验证数据点
      if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
        throw new Error('数据点数组不能为空');
      }
      
      const validatedDataPoints = this.validateHeatMapDataPoints(dataPoints);
      const validatedOptions = this.validateHeatMapOptions(options);
      
      const result = await BaiduMapModule.addHeatMap(validatedDataPoints, validatedOptions);
      
      logger.info('热力图添加成功', result);
      
      return result;
      
    } catch (error: any) {
      logger.error('添加热力图失败', error);
      throw new Error(`添加热力图失败: ${error.message || error}`);
    }
  }

  /**
   * 移除热力图
   * 
   * @returns Promise<{success: boolean, message: string}>
   * 
   * @example
   * ```typescript
   * const result = await MapUtils.removeHeatMap();
   * console.log('热力图移除结果:', result.message);
   * ```
   */
  static async removeHeatMap(): Promise<{success: boolean, message: string}> {
    const logger = this.logger;
    
    try {
      logger.info('移除热力图');
      
      const result = await BaiduMapModule.removeHeatMap();
      
      logger.info('热力图移除成功', result);
      
      return result;
      
    } catch (error: any) {
      logger.error('移除热力图失败', error);
      throw new Error(`移除热力图失败: ${error.message || error}`);
    }
  }

  /**
   * 验证截图选项
   */
  private static validateSnapshotOptions(options: SnapshotOptions): SnapshotOptions {
    const validated: SnapshotOptions = {};
    
    // 验证格式
    if (options.format) {
      const validFormats = ['png', 'jpg', 'jpeg'];
      if (!validFormats.includes(options.format)) {
        throw new Error(`不支持的图片格式: ${options.format}，支持的格式: ${validFormats.join(', ')}`);
      }
      validated.format = options.format;
    }
    
    // 验证质量
    if (options.quality !== undefined) {
      if (typeof options.quality !== 'number' || options.quality < 0 || options.quality > 1) {
        throw new Error('图片质量必须是0-1之间的数字');
      }
      validated.quality = options.quality;
    }
    
    // 验证尺寸
    if (options.width !== undefined) {
      if (typeof options.width !== 'number' || options.width <= 0) {
        throw new Error('宽度必须是正数');
      }
      validated.width = Math.floor(options.width);
    }
    
    if (options.height !== undefined) {
      if (typeof options.height !== 'number' || options.height <= 0) {
        throw new Error('高度必须是正数');
      }
      validated.height = Math.floor(options.height);
    }
    
    return validated;
  }

  /**
   * 验证热力图数据点
   */
  private static validateHeatMapDataPoints(dataPoints: HeatMapDataPoint[]): HeatMapDataPoint[] {
    return dataPoints.map((point, index) => {
      if (typeof point !== 'object' || point === null) {
        throw new Error(`数据点 ${index} 必须是对象`);
      }
      
      if (typeof point.latitude !== 'number' || isNaN(point.latitude)) {
        throw new Error(`数据点 ${index} 的纬度必须是有效数字`);
      }
      
      if (typeof point.longitude !== 'number' || isNaN(point.longitude)) {
        throw new Error(`数据点 ${index} 的经度必须是有效数字`);
      }
      
      if (point.latitude < -90 || point.latitude > 90) {
        throw new Error(`数据点 ${index} 的纬度必须在-90到90之间`);
      }
      
      if (point.longitude < -180 || point.longitude > 180) {
        throw new Error(`数据点 ${index} 的经度必须在-180到180之间`);
      }
      
      const validated: HeatMapDataPoint = {
        latitude: point.latitude,
        longitude: point.longitude
      };
      
      if (point.weight !== undefined) {
        if (typeof point.weight !== 'number' || isNaN(point.weight) || point.weight < 0) {
          throw new Error(`数据点 ${index} 的权重必须是非负数`);
        }
        validated.weight = point.weight;
      }
      
      return validated;
    });
  }

  /**
   * 验证热力图选项
   */
  private static validateHeatMapOptions(options: HeatMapOptions): HeatMapOptions {
    const validated: HeatMapOptions = {};
    
    if (options.radius !== undefined) {
      if (typeof options.radius !== 'number' || options.radius <= 0) {
        throw new Error('热力图半径必须是正数');
      }
      validated.radius = Math.floor(options.radius);
    }
    
    if (options.opacity !== undefined) {
      if (typeof options.opacity !== 'number' || options.opacity < 0 || options.opacity > 1) {
        throw new Error('热力图透明度必须是0-1之间的数字');
      }
      validated.opacity = options.opacity;
    }
    
    if (options.gradient !== undefined) {
      if (!Array.isArray(options.gradient)) {
        throw new Error('热力图渐变色必须是颜色数组');
      }
      validated.gradient = options.gradient;
    }
    
    return validated;
  }
}

/**
 * 地图动画工具类
 */
export class MapAnimationUtils {
  private static logger = Logger.getInstance();

  /**
   * 平滑移动到指定位置
   * 
   * @param latitude 纬度
   * @param longitude 经度
   * @param duration 动画时长（毫秒）
   * @returns Promise<void>
   */
  static async animateToLocation(latitude: number, longitude: number, duration: number = 1000): Promise<void> {
    const logger = this.logger;
    
    try {
      logger.info('开始地图动画移动', { latitude, longitude, duration });
      
      // 验证坐标
      if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error('纬度必须是-90到90之间的有效数字');
      }
      
      if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error('经度必须是-180到180之间的有效数字');
      }
      
      if (typeof duration !== 'number' || duration < 0) {
        throw new Error('动画时长必须是非负数');
      }
      
      // TODO: 实现地图动画移动
      // 当前版本暂不支持，可以在后续版本中实现
      logger.warn('地图动画功能暂未实现，将在后续版本中支持');
      
    } catch (error: any) {
      logger.error('地图动画移动失败', error);
      throw new Error(`地图动画移动失败: ${error.message || error}`);
    }
  }

  /**
   * 平滑缩放到指定级别
   * 
   * @param zoomLevel 缩放级别
   * @param duration 动画时长（毫秒）
   * @returns Promise<void>
   */
  static async animateToZoom(zoomLevel: number, duration: number = 1000): Promise<void> {
    const logger = this.logger;
    
    try {
      logger.info('开始地图缩放动画', { zoomLevel, duration });
      
      // 验证缩放级别
      if (typeof zoomLevel !== 'number' || isNaN(zoomLevel) || zoomLevel < 3 || zoomLevel > 21) {
        throw new Error('缩放级别必须是3-21之间的有效数字');
      }
      
      if (typeof duration !== 'number' || duration < 0) {
        throw new Error('动画时长必须是非负数');
      }
      
      // TODO: 实现地图缩放动画
      // 当前版本暂不支持，可以在后续版本中实现
      logger.warn('地图缩放动画功能暂未实现，将在后续版本中支持');
      
    } catch (error: any) {
      logger.error('地图缩放动画失败', error);
      throw new Error(`地图缩放动画失败: ${error.message || error}`);
    }
  }
}

/**
 * 离线地图工具类
 */
export class OfflineMapUtils {
  private static logger = Logger.getInstance();

  /**
   * 下载离线地图
   * 
   * @param cityId 城市ID
   * @param cityName 城市名称
   * @returns Promise<{success: boolean, message: string}>
   */
  static async downloadOfflineMap(cityId: string, cityName: string): Promise<{success: boolean, message: string}> {
    const logger = this.logger;
    
    try {
      logger.info('开始下载离线地图', { cityId, cityName });
      
      if (!cityId || typeof cityId !== 'string') {
        throw new Error('城市ID不能为空');
      }
      
      if (!cityName || typeof cityName !== 'string') {
        throw new Error('城市名称不能为空');
      }
      
      // TODO: 实现离线地图下载
      // 当前版本暂不支持，可以在后续版本中实现
      logger.warn('离线地图下载功能暂未实现，将在后续版本中支持');
      
      return {
        success: false,
        message: '离线地图下载功能暂未实现，将在后续版本中支持'
      };
      
    } catch (error: any) {
      logger.error('下载离线地图失败', error);
      throw new Error(`下载离线地图失败: ${error.message || error}`);
    }
  }

  /**
   * 获取离线地图列表
   * 
   * @returns Promise<Array<{cityId: string, cityName: string, status: string}>>
   */
  static async getOfflineMapList(): Promise<Array<{cityId: string, cityName: string, status: string}>> {
    const logger = this.logger;
    
    try {
      logger.info('获取离线地图列表');
      
      // TODO: 实现获取离线地图列表
      // 当前版本暂不支持，可以在后续版本中实现
      logger.warn('获取离线地图列表功能暂未实现，将在后续版本中支持');
      
      return [];
      
    } catch (error: any) {
      logger.error('获取离线地图列表失败', error);
      throw new Error(`获取离线地图列表失败: ${error.message || error}`);
    }
  }
}