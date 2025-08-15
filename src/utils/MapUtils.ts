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
  private static logger = Logger;

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
  private static logger = Logger;

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
      
      // 实现地图动画移动
      // 当集成百度地图SDK后，可以使用真实的地图动画功能
      
      // 模拟地图动画移动 - 在真实环境中替换为实际的百度地图动画实现
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          logger.info('地图动画移动完成', { latitude, longitude });
          resolve();
        }, Math.min(duration, 3000)); // 最大3秒动画时长
      });
      
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
      
      // 实现地图缩放动画
      // 当集成百度地图SDK后，可以使用真实的地图缩放动画功能
      
      // 模拟地图缩放动画 - 在真实环境中替换为实际的百度地图缩放动画实现
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          logger.info('地图缩放动画完成', { zoomLevel });
          resolve();
        }, Math.min(duration, 3000)); // 最大3秒动画时长
      });
      
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
  private static logger = Logger;

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
      
      // 当集成百度地图SDK后，可以使用真实的离线地图下载功能
      // 目前提供模拟实现
      
      // 模拟离线地图下载 - 在真实环境中替换为实际的百度地图离线地图功能
      const result = {
        success: true,
        message: `离线地图下载请求已发送: ${cityName.trim()}`,
        cityId: cityId.trim(),
        cityName: cityName.trim()
      };
      
      logger.info('离线地图下载请求已发送', result);
      
      return result;
      
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
      
      // 当集成百度地图SDK后，可以使用真实的离线地图列表获取功能
      // 目前提供模拟实现
      
      // 模拟离线地图列表 - 在真实环境中替换为实际的百度地图离线地图列表
      const result = [
        { cityId: '131', cityName: '北京市', status: 'downloaded' },
        { cityId: '289', cityName: '上海市', status: 'downloading' },
        { cityId: '257', cityName: '广州市', status: 'available' },
        { cityId: '340', cityName: '深圳市', status: 'available' }
      ];
      
      logger.info('获取离线地图列表成功', { count: result.length });
      
      return result;
      
    } catch (error: any) {
      logger.error('获取离线地图列表失败', error);
      throw new Error(`获取离线地图列表失败: ${error.message || error}`);
    }
  }

  /**
   * 删除离线地图
   * 
   * @param cityId 城市ID
   * @returns Promise<{success: boolean, message: string}>
   * 
   * @example
   * ```typescript
   * const result = await OfflineMapUtils.deleteOfflineMap('131');
   * console.log('删除结果:', result.message);
   * ```
   */
  static async deleteOfflineMap(cityId: string): Promise<{ success: boolean, message: string }> {
    const logger = this.logger;

    try {
      logger.info('删除离线地图', { cityId });

      if (!cityId || typeof cityId !== 'string') {
        throw new Error('城市ID不能为空');
      }

      // 当集成百度地图SDK后，可以使用真实的离线地图删除功能
      // 目前提供模拟实现
      
      // 模拟离线地图删除 - 在真实环境中替换为实际的百度地图离线地图删除
      const result = {
        success: true,
        message: `离线地图删除成功: ${cityId}`
      };

      logger.info('离线地图删除成功', result);

      return result;

    } catch (error: any) {
      logger.error('删除离线地图失败', error);
      throw new Error(`删除离线地图失败: ${error.message || error}`);
    }
  }

  /**
   * 暂停离线地图下载
   * 
   * @param cityId 城市ID
   * @returns Promise<{success: boolean, message: string}>
   */
  static async pauseOfflineMapDownload(cityId: string): Promise<{ success: boolean, message: string }> {
    const logger = this.logger;

    try {
      logger.info('暂停离线地图下载', { cityId });

      if (!cityId || typeof cityId !== 'string') {
        throw new Error('城市ID不能为空');
      }

      // 当集成百度地图SDK后，可以使用真实的离线地图下载暂停功能
      // 目前提供模拟实现
      
      const result = {
        success: true,
        message: `离线地图下载已暂停: ${cityId}`
      };

      logger.info('离线地图下载暂停成功', result);

      return result;

    } catch (error: any) {
      logger.error('暂停离线地图下载失败', error);
      throw new Error(`暂停离线地图下载失败: ${error.message || error}`);
    }
  }

  /**
   * 恢复离线地图下载
   * 
   * @param cityId 城市ID
   * @returns Promise<{success: boolean, message: string}>
   */
  static async resumeOfflineMapDownload(cityId: string): Promise<{ success: boolean, message: string }> {
    const logger = this.logger;

    try {
      logger.info('恢复离线地图下载', { cityId });

      if (!cityId || typeof cityId !== 'string') {
        throw new Error('城市ID不能为空');
      }

      // 当集成百度地图SDK后，可以使用真实的离线地图下载恢复功能
      // 目前提供模拟实现
      
      const result = {
        success: true,
        message: `离线地图下载已恢复: ${cityId}`
      };

      logger.info('离线地图下载恢复成功', result);

      return result;

    } catch (error: any) {
      logger.error('恢复离线地图下载失败', error);
      throw new Error(`恢复离线地图下载失败: ${error.message || error}`);
    }
  }

  /**
   * 获取离线地图下载进度
   * 
   * @param cityId 城市ID
   * @returns Promise<{cityId: string, progress: number, status: string}>
   */
  static async getOfflineMapProgress(cityId: string): Promise<{ cityId: string, progress: number, status: string }> {
    const logger = this.logger;

    try {
      logger.info('获取离线地图下载进度', { cityId });

      if (!cityId || typeof cityId !== 'string') {
        throw new Error('城市ID不能为空');
      }

      // 当集成百度地图SDK后，可以使用真实的离线地图进度获取功能
      // 目前提供模拟实现
      
      const result = {
        cityId: cityId,
        progress: Math.floor(Math.random() * 100),
        status: 'downloading'
      };

      logger.info('获取离线地图进度成功', result);

      return result;

    } catch (error: any) {
      logger.error('获取离线地图进度失败', error);
      throw new Error(`获取离线地图进度失败: ${error.message || error}`);
    }
  }
}
/**

 * 坐标转换工具类
 */
export class CoordinateUtils {
  private static logger = Logger;

  /**
   * WGS84坐标转换为BD09坐标
   * 
   * @param latitude WGS84纬度
   * @param longitude WGS84经度
   * @returns Promise<{latitude: number, longitude: number}>
   * 
   * @example
   * ```typescript
   * const result = await CoordinateUtils.wgs84ToBd09(39.915, 116.404);
   * console.log('转换后的坐标:', result);
   * ```
   */
  static async wgs84ToBd09(latitude: number, longitude: number): Promise<{ latitude: number, longitude: number }> {
    const logger = this.logger;

    try {
      logger.debug('WGS84坐标转换为BD09', { latitude, longitude });

      // 验证坐标
      this.validateCoordinate(latitude, longitude);

      // 当集成百度地图SDK后，可以使用真实的坐标转换功能
      // 目前提供模拟实现
      
      // 模拟坐标转换 - 在真实环境中替换为实际的百度地图坐标转换
      const result = {
        latitude: latitude + 0.006,
        longitude: longitude + 0.0065
      };

      logger.debug('坐标转换完成', result);
      return result;

    } catch (error: any) {
      logger.error('坐标转换失败', error);
      throw new Error(`坐标转换失败: ${error.message || error}`);
    }
  }

  /**
   * BD09坐标转换为WGS84坐标
   * 
   * @param latitude BD09纬度
   * @param longitude BD09经度
   * @returns Promise<{latitude: number, longitude: number}>
   * 
   * @example
   * ```typescript
   * const result = await CoordinateUtils.bd09ToWgs84(39.921, 116.4105);
   * console.log('转换后的坐标:', result);
   * ```
   */
  static async bd09ToWgs84(latitude: number, longitude: number): Promise<{ latitude: number, longitude: number }> {
    const logger = this.logger;

    try {
      logger.debug('BD09坐标转换为WGS84', { latitude, longitude });

      // 验证坐标
      this.validateCoordinate(latitude, longitude);

      // 当集成百度地图SDK后，可以使用真实的坐标转换功能
      // 目前提供模拟实现
      
      // 模拟坐标转换 - 在真实环境中替换为实际的百度地图坐标转换
      const result = {
        latitude: latitude - 0.006,
        longitude: longitude - 0.0065
      };

      logger.debug('坐标转换完成', result);
      return result;

    } catch (error: any) {
      logger.error('坐标转换失败', error);
      throw new Error(`坐标转换失败: ${error.message || error}`);
    }
  }

  /**
   * 计算两点之间的距离（米）
   * 
   * @param lat1 第一个点的纬度
   * @param lng1 第一个点的经度
   * @param lat2 第二个点的纬度
   * @param lng2 第二个点的经度
   * @returns 距离（米）
   * 
   * @example
   * ```typescript
   * const distance = CoordinateUtils.calculateDistance(39.915, 116.404, 39.916, 116.405);
   * console.log('两点距离:', distance, '米');
   * ```
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    try {
      // 验证坐标
      this.validateCoordinate(lat1, lng1);
      this.validateCoordinate(lat2, lng2);

      const R = 6371000; // 地球半径（米）
      const dLat = this.toRadians(lat2 - lat1);
      const dLng = this.toRadians(lng2 - lng1);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return Math.round(distance);

    } catch (error: any) {
      this.logger.error('计算距离失败', error);
      throw new Error(`计算距离失败: ${error.message || error}`);
    }
  }

  /**
   * 计算方位角（度）
   * 
   * @param lat1 起点纬度
   * @param lng1 起点经度
   * @param lat2 终点纬度
   * @param lng2 终点经度
   * @returns 方位角（0-360度）
   * 
   * @example
   * ```typescript
   * const bearing = CoordinateUtils.calculateBearing(39.915, 116.404, 39.916, 116.405);
   * console.log('方位角:', bearing, '度');
   * ```
   */
  static calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    try {
      // 验证坐标
      this.validateCoordinate(lat1, lng1);
      this.validateCoordinate(lat2, lng2);

      const dLng = this.toRadians(lng2 - lng1);
      const lat1Rad = this.toRadians(lat1);
      const lat2Rad = this.toRadians(lat2);

      const y = Math.sin(dLng) * Math.cos(lat2Rad);
      const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

      let bearing = this.toDegrees(Math.atan2(y, x));
      bearing = (bearing + 360) % 360; // 确保结果在0-360度之间

      return Math.round(bearing);

    } catch (error: any) {
      this.logger.error('计算方位角失败', error);
      throw new Error(`计算方位角失败: ${error.message || error}`);
    }
  }

  /**
   * 验证坐标有效性
   */
  public static validateCoordinate(latitude: number, longitude: number): void {
    if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
      throw new Error('纬度必须是-90到90之间的有效数字');
    }

    if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('经度必须是-180到180之间的有效数字');
    }
  }

  /**
   * 角度转弧度
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 弧度转角度
   */
  private static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}

/**
 * 地图区域工具类
 */
export class MapRegionUtils {
  private static logger = Logger;

  /**
   * 计算包含所有点的最小区域
   * 
   * @param points 坐标点数组
   * @param padding 边距（可选）
   * @returns 区域信息
   * 
   * @example
   * ```typescript
   * const points = [
   *   { latitude: 39.915, longitude: 116.404 },
   *   { latitude: 39.916, longitude: 116.405 },
   *   { latitude: 39.917, longitude: 116.406 }
   * ];
   * 
   * const region = MapRegionUtils.calculateBoundingRegion(points, 0.01);
   * console.log('区域信息:', region);
   * ```
   */
  static calculateBoundingRegion(
    points: Array<{ latitude: number, longitude: number }>,
    padding: number = 0.01
  ): { 
    latitude: number, 
    longitude: number, 
    latitudeDelta: number, 
    longitudeDelta: number 
  } {
    const logger = this.logger;

    try {
      if (!Array.isArray(points) || points.length === 0) {
        throw new Error('坐标点数组不能为空');
      }

      // 验证所有坐标点
      points.forEach((point, index) => {
        if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
          throw new Error(`坐标点 ${index} 格式无效`);
        }
        CoordinateUtils.validateCoordinate(point.latitude, point.longitude);
      });

      // 计算边界
      let minLat = points[0].latitude;
      let maxLat = points[0].latitude;
      let minLng = points[0].longitude;
      let maxLng = points[0].longitude;

      points.forEach(point => {
        minLat = Math.min(minLat, point.latitude);
        maxLat = Math.max(maxLat, point.latitude);
        minLng = Math.min(minLng, point.longitude);
        maxLng = Math.max(maxLng, point.longitude);
      });

      // 计算中心点和范围
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = Math.max(maxLat - minLat + padding, 0.01);
      const lngDelta = Math.max(maxLng - minLng + padding, 0.01);

      const result = {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta
      };

      logger.debug('计算区域完成', result);
      return result;

    } catch (error: any) {
      logger.error('计算区域失败', error);
      throw new Error(`计算区域失败: ${error.message || error}`);
    }
  }

  /**
   * 检查点是否在区域内
   * 
   * @param point 要检查的点
   * @param region 区域信息
   * @returns 是否在区域内
   */
  static isPointInRegion(
    point: { latitude: number, longitude: number },
    region: { latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number }
  ): boolean {
    try {
      // 验证参数
      CoordinateUtils.validateCoordinate(point.latitude, point.longitude);
      CoordinateUtils.validateCoordinate(region.latitude, region.longitude);

      const halfLatDelta = region.latitudeDelta / 2;
      const halfLngDelta = region.longitudeDelta / 2;

      const minLat = region.latitude - halfLatDelta;
      const maxLat = region.latitude + halfLatDelta;
      const minLng = region.longitude - halfLngDelta;
      const maxLng = region.longitude + halfLngDelta;

      return point.latitude >= minLat && 
             point.latitude <= maxLat && 
             point.longitude >= minLng && 
             point.longitude <= maxLng;

    } catch (error: any) {
      this.logger.error('检查点是否在区域内失败', error);
      return false;
    }
  }
}