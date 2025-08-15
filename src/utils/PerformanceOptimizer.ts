import { LatLng, Region } from '../types';

/**
 * 性能优化工具类
 * 提供地图视图内存管理、标记聚合、定位防抖等优化功能
 */
export class PerformanceOptimizer {
  private static locationCache: Map<string, { location: LatLng; timestamp: number }> = new Map();
  private static readonly LOCATION_CACHE_DURATION = 60000; // 1分钟缓存
  private static readonly DEBOUNCE_DELAY = 300; // 防抖延迟300ms
  private static debounceTimers: Map<string, any> = new Map();

  /**
   * 标记聚合算法
   * 将相近的标记聚合成一个聚合标记
   */
  static clusterMarkers(
    markers: Array<{ coordinate: LatLng; [key: string]: any }>,
    zoomLevel: number,
    clusterRadius: number = 50
  ): Array<{
    coordinate: LatLng;
    count: number;
    markers: Array<{ coordinate: LatLng; [key: string]: any }>;
    isCluster: boolean;
  }> {
    if (!markers || markers.length === 0) {
      return [];
    }

    // 根据缩放级别调整聚合半径
    const adjustedRadius = this.getAdjustedClusterRadius(zoomLevel, clusterRadius);
    const clusters: Array<{
      coordinate: LatLng;
      count: number;
      markers: Array<{ coordinate: LatLng; [key: string]: any }>;
      isCluster: boolean;
    }> = [];
    const processed = new Set<number>();

    for (let i = 0; i < markers.length; i++) {
      if (processed.has(i)) continue;

      const currentMarker = markers[i];
      const cluster = {
        coordinate: currentMarker.coordinate,
        count: 1,
        markers: [currentMarker],
        isCluster: false,
      };

      // 查找附近的标记
      for (let j = i + 1; j < markers.length; j++) {
        if (processed.has(j)) continue;

        const distance = this.calculatePixelDistance(
          currentMarker.coordinate,
          markers[j].coordinate,
          zoomLevel
        );

        if (distance <= adjustedRadius) {
          cluster.markers.push(markers[j]);
          cluster.count++;
          processed.add(j);
        }
      }

      // 如果有多个标记，计算聚合中心点
      if (cluster.count > 1) {
        cluster.coordinate = this.calculateClusterCenter(cluster.markers);
        cluster.isCluster = true;
      }

      clusters.push(cluster);
      processed.add(i);
    }

    return clusters;
  }

  /**
   * 根据缩放级别调整聚合半径
   */
  private static getAdjustedClusterRadius(zoomLevel: number, baseRadius: number): number {
    // 缩放级别越高，聚合半径越小
    const factor = Math.max(0.5, 1 - (zoomLevel - 10) * 0.1);
    return baseRadius * factor;
  }

  /**
   * 计算两点间的像素距离
   */
  private static calculatePixelDistance(coord1: LatLng, coord2: LatLng, zoomLevel: number): number {
    const earthRadius = 6378137; // 地球半径（米）
    const pixelsPerMeter = (256 * Math.pow(2, zoomLevel)) / (2 * Math.PI * earthRadius);
    
    const lat1Rad = (coord1.latitude * Math.PI) / 180;
    const lat2Rad = (coord2.latitude * Math.PI) / 180;
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return distance * pixelsPerMeter;
  }

  /**
   * 计算聚合中心点
   */
  private static calculateClusterCenter(markers: Array<{ coordinate: LatLng; [key: string]: any }>): LatLng {
    let totalLat = 0;
    let totalLng = 0;

    for (const marker of markers) {
      totalLat += marker.coordinate.latitude;
      totalLng += marker.coordinate.longitude;
    }

    return {
      latitude: totalLat / markers.length,
      longitude: totalLng / markers.length,
    };
  }

  /**
   * 定位防抖机制
   */
  static debounceLocation(
    key: string,
    callback: () => void,
    delay: number = this.DEBOUNCE_DELAY
  ): void {
    // 清除之前的定时器
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * 定位缓存机制
   */
  static getCachedLocation(key: string): LatLng | null {
    const cached = this.locationCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.LOCATION_CACHE_DURATION) {
      this.locationCache.delete(key);
      return null;
    }

    return cached.location;
  }

  /**
   * 缓存定位结果
   */
  static cacheLocation(key: string, location: LatLng): void {
    this.locationCache.set(key, {
      location,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除定位缓存
   */
  static clearLocationCache(key?: string): void {
    if (key) {
      this.locationCache.delete(key);
    } else {
      this.locationCache.clear();
    }
  }

  /**
   * 视口优化：判断标记是否在可视区域内
   */
  static isMarkerInViewport(
    markerCoordinate: LatLng,
    region: Region,
    buffer: number = 0.1
  ): boolean {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    
    const minLat = latitude - latitudeDelta / 2 - buffer;
    const maxLat = latitude + latitudeDelta / 2 + buffer;
    const minLng = longitude - longitudeDelta / 2 - buffer;
    const maxLng = longitude + longitudeDelta / 2 + buffer;

    return (
      markerCoordinate.latitude >= minLat &&
      markerCoordinate.latitude <= maxLat &&
      markerCoordinate.longitude >= minLng &&
      markerCoordinate.longitude <= maxLng
    );
  }

  /**
   * 过滤可视区域内的标记
   */
  static filterMarkersInViewport<T extends { coordinate: LatLng }>(
    markers: T[],
    region: Region,
    buffer: number = 0.1
  ): T[] {
    return markers.filter(marker => 
      this.isMarkerInViewport(marker.coordinate, region, buffer)
    );
  }

  /**
   * 内存管理：清理资源
   */
  static cleanup(): void {
    // 清除所有防抖定时器
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    // 清除定位缓存
    this.locationCache.clear();
  }

  /**
   * 节流函数
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  /**
   * 批量处理：将大量操作分批执行
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    delay: number = 0
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
      
      // 如果不是最后一批，添加延迟
      if (i + batchSize < items.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  /**
   * 地图瓦片预加载优化
   */
  static calculatePreloadTiles(
    center: LatLng,
    zoomLevel: number,
    viewportSize: { width: number; height: number },
    preloadRadius: number = 1
  ): Array<{ x: number; y: number; z: number }> {
    const tiles: Array<{ x: number; y: number; z: number }> = [];
    
    // 计算中心瓦片坐标
    const centerTile = this.latLngToTile(center, zoomLevel);
    
    // 计算需要预加载的瓦片范围
    const tilesX = Math.ceil(viewportSize.width / 256) + preloadRadius * 2;
    const tilesY = Math.ceil(viewportSize.height / 256) + preloadRadius * 2;
    
    const startX = centerTile.x - Math.floor(tilesX / 2);
    const startY = centerTile.y - Math.floor(tilesY / 2);
    
    for (let x = startX; x < startX + tilesX; x++) {
      for (let y = startY; y < startY + tilesY; y++) {
        if (x >= 0 && y >= 0 && x < Math.pow(2, zoomLevel) && y < Math.pow(2, zoomLevel)) {
          tiles.push({ x, y, z: zoomLevel });
        }
      }
    }
    
    return tiles;
  }

  /**
   * 经纬度转瓦片坐标
   */
  private static latLngToTile(coordinate: LatLng, zoomLevel: number): { x: number; y: number } {
    const { latitude, longitude } = coordinate;
    const n = Math.pow(2, zoomLevel);
    const x = Math.floor(((longitude + 180) / 360) * n);
    const y = Math.floor(
      ((1 - Math.log(Math.tan((latitude * Math.PI) / 180) + 1 / Math.cos((latitude * Math.PI) / 180)) / Math.PI) / 2) * n
    );
    
    return { x, y };
  }

  /**
   * 获取性能统计信息
   */
  static getPerformanceStats(): {
    locationCacheSize: number;
    debounceTimersCount: number;
    memoryUsage?: number;
  } {
    const stats = {
      locationCacheSize: this.locationCache.size,
      debounceTimersCount: this.debounceTimers.size,
    };

    // 如果支持，添加内存使用情况
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      (stats as any).memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    return stats;
  }

  /**
   * 自动清理过期缓存
   */
  static startAutoCleanup(interval: number = 300000): NodeJS.Timeout {
    return setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      this.locationCache.forEach((value, key) => {
        if (now - value.timestamp > this.LOCATION_CACHE_DURATION) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.locationCache.delete(key));
      
      if (keysToDelete.length > 0) {
        console.log(`清理了 ${keysToDelete.length} 个过期的定位缓存`);
      }
    }, interval);
  }

  /**
   * 停止自动清理
   */
  static stopAutoCleanup(timer: NodeJS.Timeout): void {
    clearInterval(timer);
  }
}

export default PerformanceOptimizer;