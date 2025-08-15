import { Logger } from './Logger';
import { MemoryManager } from './MemoryManager';

export interface NetworkConfig {
  enableCaching: boolean;
  cacheSize: number; // MB
  cacheTTL: number; // 缓存生存时间（毫秒）
  enableCompression: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableOfflineSupport: boolean;
  enableIncrementalUpdate: boolean;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  size: number;
  accessCount: number;
  lastAccess: number;
}

export interface NetworkMetrics {
  requestCount: number;
  cacheHitCount: number;
  cacheMissCount: number;
  totalDataTransferred: number;
  averageResponseTime: number;
  errorCount: number;
  retryCount: number;
}

/**
 * 网络和缓存优化器
 * 提供智能缓存、数据压缩、离线支持等功能
 */
export class NetworkOptimizer {
  private static instance: NetworkOptimizer;
  private logger = Logger;
  private memoryManager = MemoryManager.getInstance();

  private config: NetworkConfig = {
    enableCaching: true,
    cacheSize: 50, // 50MB
    cacheTTL: 30 * 60 * 1000, // 30分钟
    enableCompression: true,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000,
    enableOfflineSupport: true,
    enableIncrementalUpdate: true,
  };

  private cache = new Map<string, CacheEntry>();
  private offlineQueue: Array<{
    url: string;
    options: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  private metrics: NetworkMetrics = {
    requestCount: 0,
    cacheHitCount: 0,
    cacheMissCount: 0,
    totalDataTransferred: 0,
    averageResponseTime: 0,
    errorCount: 0,
    retryCount: 0,
  };

  private responseTimes: number[] = [];
  private isOnline = true;

  private constructor() {
    this.initializeNetworkMonitoring();
  }

  /**
   * 获取网络优化器单例
   */
  static getInstance(): NetworkOptimizer {
    if (!NetworkOptimizer.instance) {
      NetworkOptimizer.instance = new NetworkOptimizer();
    }
    return NetworkOptimizer.instance;
  }

  /**
   * 配置网络优化器
   */
  configure(config: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('网络优化器配置已更新', this.config);
  }

  /**
   * 优化的网络请求
   */
  async optimizedFetch(url: string, options: any = {}): Promise<any> {
    const timerId = this.logger.startPerformanceTimer('network_request');
    const startTime = Date.now();

    try {
      this.metrics.requestCount++;

      // 检查缓存
      if (this.config.enableCaching && options.method !== 'POST') {
        const cached = this.getFromCache(url);
        if (cached) {
          this.metrics.cacheHitCount++;
          this.logger.endPerformanceTimer(timerId, true);
          return cached;
        }
        this.metrics.cacheMissCount++;
      }

      // 检查网络状态
      if (!this.isOnline && this.config.enableOfflineSupport) {
        return this.handleOfflineRequest(url, options);
      }

      // 执行请求
      const response = await this.executeRequest(url, options);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.updateResponseTimeMetrics(responseTime);

      // 缓存响应
      if (this.config.enableCaching && response && options.method !== 'POST') {
        this.addToCache(url, response);
      }

      this.logger.endPerformanceTimer(timerId, true);
      return response;

    } catch (error) {
      this.metrics.errorCount++;
      this.logger.endPerformanceTimer(timerId, false, error as any);
      
      // 重试机制
      if (this.config.enableRetry && this.shouldRetry(error)) {
        return this.retryRequest(url, options);
      }

      throw error;
    }
  }

  /**
   * 执行网络请求
   */
  private async executeRequest(url: string, options: any): Promise<any> {
    const requestOptions = {
      ...options,
      timeout: this.config.timeout,
    };

    // 添加压缩支持
    if (this.config.enableCompression) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Accept-Encoding': 'gzip, deflate, br',
      };
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 估算数据大小
    const dataSize = this.estimateDataSize(data);
    this.metrics.totalDataTransferred += dataSize;

    return data;
  }

  /**
   * 重试请求
   */
  private async retryRequest(url: string, options: any, attempt: number = 1): Promise<any> {
    if (attempt > this.config.maxRetries) {
      throw new Error(`请求失败，已重试 ${this.config.maxRetries} 次`);
    }

    this.metrics.retryCount++;
    this.logger.warn(`网络请求重试 ${attempt}/${this.config.maxRetries}`, { url });

    // 等待重试延迟
    await this.delay(this.config.retryDelay * attempt);

    try {
      return await this.optimizedFetch(url, options);
    } catch (error) {
      return this.retryRequest(url, options, attempt + 1);
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    // 网络错误或服务器错误可以重试
    if (error.name === 'TypeError' || error.name === 'NetworkError') {
      return true;
    }

    // 5xx 服务器错误可以重试
    if (error.message && error.message.includes('HTTP 5')) {
      return true;
    }

    // 超时错误可以重试
    if (error.name === 'TimeoutError') {
      return true;
    }

    return false;
  }

  /**
   * 处理离线请求
   */
  private handleOfflineRequest(url: string, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // 检查离线缓存
      const cached = this.getFromCache(url);
      if (cached) {
        this.logger.info('使用离线缓存数据', { url });
        resolve(cached);
        return;
      }

      // 添加到离线队列
      this.offlineQueue.push({ url, options, resolve, reject });
      this.logger.info('请求已添加到离线队列', { url, queueSize: this.offlineQueue.length });
    });
  }

  /**
   * 处理离线队列
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    this.logger.info('开始处理离线队列', { queueSize: this.offlineQueue.length });

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        const response = await this.optimizedFetch(item.url, item.options);
        item.resolve(response);
      } catch (error) {
        item.reject(error);
      }
    }
  }

  /**
   * 添加到缓存
   */
  private addToCache(key: string, data: any): void {
    try {
      const size = this.estimateDataSize(data);
      const totalCacheSize = this.getTotalCacheSize();

      // 检查缓存大小限制
      if (totalCacheSize + size > this.config.cacheSize * 1024 * 1024) {
        this.evictLeastRecentlyUsed();
      }

      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: this.config.cacheTTL,
        size,
        accessCount: 0,
        lastAccess: Date.now(),
      });

      this.logger.debug('添加网络缓存', { key, size: size / 1024 + 'KB' });

    } catch (error) {
      this.logger.error('添加网络缓存失败', error);
    }
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccess = now;

    return entry.data;
  }

  /**
   * 驱逐最少使用的缓存项
   */
  private evictLeastRecentlyUsed(): void {
    if (this.cache.size === 0) return;

    let lruKey = '';
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < lruTime) {
        lruKey = key;
        lruTime = entry.lastAccess;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.logger.debug('驱逐LRU网络缓存', { key: lruKey });
    }
  }

  /**
   * 获取总缓存大小
   */
  private getTotalCacheSize(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * 估算数据大小
   */
  private estimateDataSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch (error) {
      return 1024; // 1KB 默认估算
    }
  }

  /**
   * 更新响应时间指标
   */
  private updateResponseTimeMetrics(responseTime: number): void {
    this.responseTimes.push(responseTime);
    
    // 保持响应时间历史在合理范围内
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-50);
    }

    // 计算平均响应时间
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  /**
   * 初始化网络监控
   */
  private initializeNetworkMonitoring(): void {
    // 监听网络状态变化
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.logger.info('网络已连接');
        this.processOfflineQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.logger.warn('网络已断开');
      });
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理过期缓存
   */
  clearExpiredCache(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.logger.info('清理过期网络缓存', { cleared });
    }

    return cleared;
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info('清空所有网络缓存', { cleared: size });
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    averageAccessCount: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalSize = this.getTotalCacheSize();
    const totalRequests = this.metrics.cacheHitCount + this.metrics.cacheMissCount;
    const hitRate = totalRequests > 0 ? this.metrics.cacheHitCount / totalRequests : 0;
    const averageAccessCount = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length 
      : 0;

    return {
      totalEntries: entries.length,
      totalSize,
      hitRate,
      averageAccessCount,
    };
  }

  /**
   * 获取网络指标
   */
  getNetworkMetrics(): NetworkMetrics & {
    cacheStats: any;
    isOnline: boolean;
    offlineQueueSize: number;
  } {
    return {
      ...this.metrics,
      cacheStats: this.getCacheStats(),
      isOnline: this.isOnline,
      offlineQueueSize: this.offlineQueue.length,
    };
  }

  /**
   * 重置网络指标
   */
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      cacheHitCount: 0,
      cacheMissCount: 0,
      totalDataTransferred: 0,
      averageResponseTime: 0,
      errorCount: 0,
      retryCount: 0,
    };
    this.responseTimes = [];
    this.logger.info('网络指标已重置');
  }

  /**
   * 生成网络优化报告
   */
  generateOptimizationReport(): {
    metrics: any;
    performance: {
      averageResponseTime: number;
      errorRate: number;
      retryRate: number;
      cacheEfficiency: number;
    };
    recommendations: string[];
  } {
    const metrics = this.getNetworkMetrics();
    const errorRate = metrics.requestCount > 0 ? metrics.errorCount / metrics.requestCount : 0;
    const retryRate = metrics.requestCount > 0 ? metrics.retryCount / metrics.requestCount : 0;
    const cacheEfficiency = metrics.cacheStats.hitRate;

    const recommendations: string[] = [];

    if (errorRate > 0.1) {
      recommendations.push('网络错误率较高，建议检查网络连接和服务器状态');
    }

    if (retryRate > 0.2) {
      recommendations.push('重试率较高，建议优化网络配置或增加超时时间');
    }

    if (cacheEfficiency < 0.5) {
      recommendations.push('缓存命中率较低，建议调整缓存策略或增加缓存时间');
    }

    if (metrics.averageResponseTime > 3000) {
      recommendations.push('平均响应时间较长，建议启用数据压缩或优化请求');
    }

    if (!this.config.enableCaching) {
      recommendations.push('建议启用缓存以提高性能');
    }

    if (!this.config.enableCompression) {
      recommendations.push('建议启用数据压缩以减少传输时间');
    }

    return {
      metrics,
      performance: {
        averageResponseTime: metrics.averageResponseTime,
        errorRate,
        retryRate,
        cacheEfficiency,
      },
      recommendations,
    };
  }

  /**
   * 销毁网络优化器
   */
  destroy(): void {
    this.cache.clear();
    this.offlineQueue = [];
    this.responseTimes = [];
    this.logger.info('网络优化器已销毁');
  }
}

/**
 * 增量更新管理器
 */
export class IncrementalUpdateManager {
  private static instance: IncrementalUpdateManager;
  private logger = Logger;
  private networkOptimizer = NetworkOptimizer.getInstance();

  private updateHistory = new Map<string, {
    lastUpdate: number;
    version: string;
    checksum: string;
  }>();

  private constructor() {}

  static getInstance(): IncrementalUpdateManager {
    if (!IncrementalUpdateManager.instance) {
      IncrementalUpdateManager.instance = new IncrementalUpdateManager();
    }
    return IncrementalUpdateManager.instance;
  }

  /**
   * 检查是否需要更新
   */
  async checkForUpdates(resource: string, currentVersion?: string): Promise<{
    needsUpdate: boolean;
    updateInfo?: {
      version: string;
      size: number;
      checksum: string;
      incrementalData?: any;
    };
  }> {
    try {
      const history = this.updateHistory.get(resource);
      const response = await this.networkOptimizer.optimizedFetch(
        `/api/updates/check/${resource}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentVersion: currentVersion || history?.version,
            lastUpdate: history?.lastUpdate,
            checksum: history?.checksum,
          }),
        }
      );

      if (response.needsUpdate) {
        return {
          needsUpdate: true,
          updateInfo: response.updateInfo,
        };
      }

      return { needsUpdate: false };

    } catch (error) {
      this.logger.error('检查更新失败', error);
      return { needsUpdate: false };
    }
  }

  /**
   * 执行增量更新
   */
  async performIncrementalUpdate(
    resource: string,
    updateInfo: any
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      this.logger.info('开始增量更新', { resource, version: updateInfo.version });

      const response = await this.networkOptimizer.optimizedFetch(
        `/api/updates/incremental/${resource}`,
        {
          method: 'GET',
          headers: {
            'If-None-Match': updateInfo.checksum,
            'X-Version': updateInfo.version,
          },
        }
      );

      // 更新历史记录
      this.updateHistory.set(resource, {
        lastUpdate: Date.now(),
        version: updateInfo.version,
        checksum: updateInfo.checksum,
      });

      this.logger.info('增量更新完成', { resource, version: updateInfo.version });

      return {
        success: true,
        data: response,
      };

    } catch (error) {
      this.logger.error('增量更新失败', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * 获取更新历史
   */
  getUpdateHistory(): Map<string, any> {
    return new Map(this.updateHistory);
  }

  /**
   * 清理更新历史
   */
  clearUpdateHistory(): void {
    this.updateHistory.clear();
    this.logger.info('更新历史已清理');
  }
}

export default NetworkOptimizer;