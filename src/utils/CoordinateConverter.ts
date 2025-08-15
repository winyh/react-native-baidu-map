import { NativeModules } from 'react-native';
import {
  LatLng,
  CoordinateType,
  CoordinateConvertResult,
} from '../types';

const { BaiduMapModule } = NativeModules;

/**
 * 坐标转换工具类
 * 支持 BD09、GCJ02、WGS84 坐标系之间的相互转换
 */
export class CoordinateConverter {
  // 地球半径（米）
  private static readonly EARTH_RADIUS = 6378245.0;
  // 偏心率平方
  private static readonly EE = 0.00669342162296594323;
  // π
  private static readonly PI = 3.1415926535897932384626;

  /**
   * 使用原生模块进行坐标转换（推荐）
   */
  static async convertCoordinate(
    coordinate: LatLng,
    from: CoordinateType,
    to: CoordinateType
  ): Promise<CoordinateConvertResult> {
    // 参数验证
    if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') {
      return {
        latitude: 0,
        longitude: 0,
        success: false,
        error: '无效的坐标参数',
      };
    }

    if (!this.isValidCoordinate(coordinate)) {
      return {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        success: false,
        error: '坐标超出有效范围',
      };
    }

    // 如果源坐标系和目标坐标系相同，直接返回
    if (from === to) {
      return {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        success: true,
      };
    }

    // 优先使用原生模块转换
    if (BaiduMapModule && BaiduMapModule.convertCoordinate) {
      try {
        const result = await BaiduMapModule.convertCoordinate(coordinate, from, to);
        if (result.success) {
          return {
            latitude: result.data.latitude,
            longitude: result.data.longitude,
            success: true,
          };
        }
      } catch (error) {
        // 原生转换失败，降级到JavaScript实现
        console.warn('Native coordinate conversion failed, falling back to JS implementation:', error);
      }
    }

    // JavaScript 实现的坐标转换
    return this.convertCoordinateJS(coordinate, from, to);
  }

  /**
   * 批量坐标转换
   */
  static async convertCoordinates(
    coordinates: LatLng[],
    from: CoordinateType,
    to: CoordinateType
  ): Promise<CoordinateConvertResult[]> {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return [];
    }

    // 如果源坐标系和目标坐标系相同，直接返回
    if (from === to) {
      return coordinates.map(coord => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
        success: true,
      }));
    }

    // 优先使用原生模块批量转换
    if (BaiduMapModule && BaiduMapModule.convertCoordinates) {
      try {
        const result = await BaiduMapModule.convertCoordinates(coordinates, from, to);
        if (result.success && Array.isArray(result.data)) {
          return result.data.map((coord: LatLng) => ({
            latitude: coord.latitude,
            longitude: coord.longitude,
            success: true,
          }));
        }
      } catch (error) {
        console.warn('Native batch coordinate conversion failed, falling back to JS implementation:', error);
      }
    }

    // JavaScript 实现的批量转换
    const results: CoordinateConvertResult[] = [];
    for (const coordinate of coordinates) {
      results.push(this.convertCoordinateJS(coordinate, from, to));
    }
    return results;
  }

  /**
   * JavaScript 实现的坐标转换
   */
  private static convertCoordinateJS(
    coordinate: LatLng,
    from: CoordinateType,
    to: CoordinateType
  ): CoordinateConvertResult {
    try {
      let result: LatLng = { ...coordinate };

      // 转换路径规划
      if (from === CoordinateType.WGS84 && to === CoordinateType.GCJ02) {
        result = this.wgs84ToGcj02(coordinate);
      } else if (from === CoordinateType.GCJ02 && to === CoordinateType.WGS84) {
        result = this.gcj02ToWgs84(coordinate);
      } else if (from === CoordinateType.GCJ02 && to === CoordinateType.BD09LL) {
        result = this.gcj02ToBd09(coordinate);
      } else if (from === CoordinateType.BD09LL && to === CoordinateType.GCJ02) {
        result = this.bd09ToGcj02(coordinate);
      } else if (from === CoordinateType.WGS84 && to === CoordinateType.BD09LL) {
        // WGS84 -> GCJ02 -> BD09
        const gcj02 = this.wgs84ToGcj02(coordinate);
        result = this.gcj02ToBd09(gcj02);
      } else if (from === CoordinateType.BD09LL && to === CoordinateType.WGS84) {
        // BD09 -> GCJ02 -> WGS84
        const gcj02 = this.bd09ToGcj02(coordinate);
        result = this.gcj02ToWgs84(gcj02);
      } else {
        return {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          success: false,
          error: `不支持的坐标转换: ${from} -> ${to}`,
        };
      }

      return {
        latitude: result.latitude,
        longitude: result.longitude,
        success: true,
      };
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
   * WGS84 转 GCJ02
   */
  private static wgs84ToGcj02(coordinate: LatLng): LatLng {
    const { latitude: lat, longitude: lng } = coordinate;
    
    if (this.outOfChina(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }

    let dLat = this.transformLat(lng - 105.0, lat - 35.0);
    let dLng = this.transformLng(lng - 105.0, lat - 35.0);
    
    const radLat = (lat / 180.0) * this.PI;
    let magic = Math.sin(radLat);
    magic = 1 - this.EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    
    dLat = (dLat * 180.0) / (((this.EARTH_RADIUS * (1 - this.EE)) / (magic * sqrtMagic)) * this.PI);
    dLng = (dLng * 180.0) / ((this.EARTH_RADIUS / sqrtMagic) * Math.cos(radLat) * this.PI);
    
    return {
      latitude: lat + dLat,
      longitude: lng + dLng,
    };
  }

  /**
   * GCJ02 转 WGS84
   */
  private static gcj02ToWgs84(coordinate: LatLng): LatLng {
    const { latitude: lat, longitude: lng } = coordinate;
    
    if (this.outOfChina(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }

    let dLat = this.transformLat(lng - 105.0, lat - 35.0);
    let dLng = this.transformLng(lng - 105.0, lat - 35.0);
    
    const radLat = (lat / 180.0) * this.PI;
    let magic = Math.sin(radLat);
    magic = 1 - this.EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    
    dLat = (dLat * 180.0) / (((this.EARTH_RADIUS * (1 - this.EE)) / (magic * sqrtMagic)) * this.PI);
    dLng = (dLng * 180.0) / ((this.EARTH_RADIUS / sqrtMagic) * Math.cos(radLat) * this.PI);
    
    return {
      latitude: lat - dLat,
      longitude: lng - dLng,
    };
  }

  /**
   * GCJ02 转 BD09
   */
  private static gcj02ToBd09(coordinate: LatLng): LatLng {
    const { latitude: lat, longitude: lng } = coordinate;
    const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * this.PI * 3000.0 / 180.0);
    const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * this.PI * 3000.0 / 180.0);
    
    return {
      latitude: z * Math.sin(theta) + 0.006,
      longitude: z * Math.cos(theta) + 0.0065,
    };
  }

  /**
   * BD09 转 GCJ02
   */
  private static bd09ToGcj02(coordinate: LatLng): LatLng {
    const { latitude: lat, longitude: lng } = coordinate;
    const x = lng - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.PI * 3000.0 / 180.0);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.PI * 3000.0 / 180.0);
    
    return {
      latitude: z * Math.sin(theta),
      longitude: z * Math.cos(theta),
    };
  }

  /**
   * 纬度转换
   */
  private static transformLat(lng: number, lat: number): number {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * this.PI) + 40.0 * Math.sin(lat / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * this.PI) + 320 * Math.sin(lat * this.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }

  /**
   * 经度转换
   */
  private static transformLng(lng: number, lat: number): number {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * this.PI) + 40.0 * Math.sin(lng / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * this.PI) + 300.0 * Math.sin(lng / 30.0 * this.PI)) * 2.0 / 3.0;
    return ret;
  }

  /**
   * 判断是否在中国境外
   */
  private static outOfChina(lat: number, lng: number): boolean {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  /**
   * 验证坐标是否有效
   */
  private static isValidCoordinate(coordinate: LatLng): boolean {
    const { latitude, longitude } = coordinate;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * 计算两点间距离（米）
   */
  static calculateDistance(coord1: LatLng, coord2: LatLng): number {
    const radLat1 = (coord1.latitude * this.PI) / 180;
    const radLat2 = (coord2.latitude * this.PI) / 180;
    const deltaLat = radLat1 - radLat2;
    const deltaLng = ((coord1.longitude - coord2.longitude) * this.PI) / 180;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS * c;
  }

  /**
   * 判断点是否在多边形内
   */
  static isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
    if (polygon.length < 3) return false;
    
    let inside = false;
    const { latitude: x, longitude: y } = point;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const { latitude: xi, longitude: yi } = polygon[i];
      const { latitude: xj, longitude: yj } = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
}

export default CoordinateConverter;