import { Logger } from './Logger';
import { PerformanceOptimizer } from './PerformanceOptimizer';

export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface MemoryThresholds {
  warning: number; // 警告阈值（MB）
  critical: number; // 严重阈值（MB）
  cleanup: number; // 清理阈值（MB）
}

export interface MemoryOptimizationConfig {
  enableAutoCleanup: boolean;
  cleanupInterval: number; // 清理检查间隔（毫秒）
  thresholds: MemoryThresholds;
  enableMemoryMonitoring: boolean;
  maxCacheSize: number; // 最大缓存大小（MB）
}

/**
 * 内存管理器
 * 提供内存监控、优化和清理功能
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private logger = Logger.getInstance();
  private performanceOptimizer = PerformanceOptimizer.getInstance();
  
  private config: MemoryOptimizationConfig = {
    enableAutoCleanup: true,
    cleanupInterval: 30000, // 30秒
    thresholds: {
      warning: 50, // 50MB
      critical: 100, // 100MB
      cleanup: 80, // 80MB
    },
    enableMemoryMonitoring: true,
    maxCacheSize: 20, // 20MB
  };

  private memoryHistory: MemoryUsage[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;
  private cacheRegistry = new Map<string, {
    data: any;
    size: number;
    timestamp: number;
    accessCount: number;
  }>();

  private constructor() {
    this.startMemoryMonitoring();
  }

  /**
   * 获取内存管理器单例
   */
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * 配置内存管理器
   */
  configure(config: Partial<MemoryOptimizationConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    } else {
      this.stopAutoCleanup();
    }

    this.logger.info('内存管理器配置已更新', this.config);
  }

  /**
   * 获取当前内存使用情况
   */
  getCurrentMemoryUsage(): MemoryUsage | null {
    try {
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now(),
        };
      }
      return null;
    } catch (error) {
      this.logger.error('获取内存使用情况失败', error);
      return null;
    }
  }

  /**
   * 获取内存使用历史
   */
  getMemoryHistory(): MemoryUsage[] {
    return [...this.memoryHistory];
  }

  /**
   * 检查内存使用状态
   */
  checkMemoryStatus(): {
    status: 'normal' | 'warning' | 'critical';
    usage: MemoryUsage | null;
    recommendations: string[];
  } {
    const usage = this.getCurrentMemoryUsage();
    const recommendations: string[] = [];
    
    if (!usage) {
      return {
        status: 'normal',
        usage: null,
        recommendations: ['无法获取内存使用信息'],
      };
    }

    const usedMB = usage.usedJSHeapSize / (1024 * 1024);
    let status: 'normal' | 'warning' | 'critical' = 'normal';

    if (usedMB >= this.config.thresholds.critical) {
      status = 'critical';
      recommendations.push('内存使用严重超标，建议立即清理缓存');
      recommendations.push('考虑减少同时显示的地图标记数量');
      recommendations.push('检查是否存在内存泄漏');
    } else if (usedMB >= this.config.thresholds.warning) {
      status = 'warning';
      recommendations.push('内存使用较高，建议清理不必要的缓存');
      recommendations.push('优化地图组件的使用');
    }

    if (usedMB >= this.config.thresholds.cleanup) {
      recommendations.push('触发自动清理阈值，将执行内存清理');
    }

    return { status, usage, recommendations };
  }

  /**
   * 执行内存清理
   */
  async performCleanup(): Promise<{
    success: boolean;
    freedMemory: number;
    actions: string[];
  }> {
    const timerId = this.logger.startPerformanceTimer('memory_cleanup');
    const beforeUsage = this.getCurrentMemoryUsage();
    const actions: string[] = [];

    try {
      // 清理过期缓存
      const cacheCleared = this.clearExpiredCache();
      if (cacheCleared > 0) {
        actions.push(`清理了 ${cacheCleared} 个过期缓存项`);
      }

      // 清理内存历史记录
      if (this.memoryHistory.length > 100) {
        const removed = this.memoryHistory.length - 50;
        this.memoryHistory = this.memoryHistory.slice(-50);
        actions.push(`清理了 ${removed} 条内存历史记录`);
      }

      // 清理性能优化器缓存
      this.performanceOptimizer.clearCache();
      actions.push('清理了性能优化器缓存');

      // 触发垃圾回收（如果可用）
      if (typeof global !== 'undefined' && (global as any).gc) {
        (global as any).gc();
        actions.push('触发了垃圾回收');
      }

      const afterUsage = this.getCurrentMemoryUsage();
      const freedMemory = beforeUsage && afterUsage 
        ? beforeUsage.usedJSHeapSize - afterUsage.usedJSHeapSize
        : 0;

      this.logger.endPerformanceTimer(timerId, true);
      this.logger.info('内存清理完成', {
        freedMemory: freedMemory / (1024 * 1024) + 'MB',
        actions,
      });

      return {
        success: true,
        freedMemory,
        actions,
      };

    } catch (error) {
      this.logger.endPerformanceTimer(timerId, false, error as any);
      this.logger.error('内存清理失败', error);
      
      return {
        success: false,
        freedMemory: 0,
        actions: ['内存清理失败: ' + (error as Error).message],
      };
    }
  }

  /**
   * 添加缓存项
   */
  addToCache(key: string, data: any, estimatedSize?: number): void {
    try {
      const size = estimatedSize || this.estimateObjectSize(data);
      const totalCacheSize = this.getTotalCacheSize();
      
      // 检查缓存大小限制
      if (totalCacheSize + size > this.config.maxCacheSize * 1024 * 1024) {
        this.evictLeastRecentlyUsed();
      }

      this.cacheRegistry.set(key, {
        data,
        size,
        timestamp: Date.now(),
        accessCount: 0,
      });

      this.logger.debug('添加缓存项', { key, size: size / 1024 + 'KB' });

    } catch (error) {
      this.logger.error('添加缓存项失败', error);
    }
  }

  /**
   * 从缓存获取数据
   */
  getFromCache(key: string): any {
    const item = this.cacheRegistry.get(key);
    if (item) {
      item.accessCount++;
      return item.data;
    }
    return null;
  }

  /**
   * 移除缓存项
   */
  removeFromCache(key: string): boolean {
    return this.cacheRegistry.delete(key);
  }

  /**
   * 清理过期缓存
   */
  private clearExpiredCache(): number {
    const now = Date.now();
    const expireTime = 10 * 60 * 1000; // 10分钟过期
    let cleared = 0;

    for (const [key, item] of this.cacheRegistry.entries()) {
      if (now - item.timestamp > expireTime) {
        this.cacheRegistry.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * 驱逐最少使用的缓存项
   */
  private evictLeastRecentlyUsed(): void {
    if (this.cacheRegistry.size === 0) return;

    let lruKey = '';
    let lruAccessCount = Infinity;
    let lruTimestamp = Infinity;

    for (const [key, item] of this.cacheRegistry.entries()) {
      if (item.accessCount < lruAccessCount || 
          (item.accessCount === lruAccessCount && item.timestamp < lruTimestamp)) {
        lruKey = key;
        lruAccessCount = item.accessCount;
        lruTimestamp = item.timestamp;
      }
    }

    if (lruKey) {
      this.cacheRegistry.delete(lruKey);
      this.logger.debug('驱逐LRU缓存项', { key: lruKey });
    }
  }

  /**
   * 获取总缓存大小
   */
  private getTotalCacheSize(): number {
    let totalSize = 0;
    for (const item of this.cacheRegistry.values()) {
      totalSize += item.size;
    }
    return totalSize;
  }

  /**
   * 估算对象大小
   */
  private estimateObjectSize(obj: any): number {
    try {
      const jsonString = JSON.stringify(obj);
      return new Blob([jsonString]).size;
    } catch (error) {
      // 如果无法序列化，返回估算值
      return 1024; // 1KB 默认估算
    }
  }

  /**
   * 开始内存监控
   */
  private startMemoryMonitoring(): void {
    if (!this.config.enableMemoryMonitoring) return;

    const monitor = () => {
      const usage = this.getCurrentMemoryUsage();
      if (usage) {
        this.memoryHistory.push(usage);
        
        // 保持历史记录在合理范围内
        if (this.memoryHistory.length > 200) {
          this.memoryHistory = this.memoryHistory.slice(-100);
        }

        // 检查是否需要清理
        const usedMB = usage.usedJSHeapSize / (1024 * 1024);
        if (usedMB >= this.config.thresholds.cleanup && this.config.enableAutoCleanup) {
          this.performCleanup();
        }
      }
    };

    // 每5秒监控一次
    setInterval(monitor, 5000);
  }

  /**
   * 开始自动清理
   */
  private startAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      const status = this.checkMemoryStatus();
      if (status.status === 'warning' || status.status === 'critical') {
        this.performCleanup();
      }
    }, this.config.cleanupInterval);
  }

  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    totalItems: number;
    totalSize: number;
    averageSize: number;
    oldestItem: number;
    newestItem: number;
  } {
    const items = Array.from(this.cacheRegistry.values());
    const totalSize = this.getTotalCacheSize();
    
    return {
      totalItems: items.length,
      totalSize,
      averageSize: items.length > 0 ? totalSize / items.length : 0,
      oldestItem: items.length > 0 ? Math.min(...items.map(item => item.timestamp)) : 0,
      newestItem: items.length > 0 ? Math.max(...items.map(item => item.timestamp)) : 0,
    };
  }

  /**
   * 生成内存报告
   */
  generateMemoryReport(): {
    currentUsage: MemoryUsage | null;
    status: string;
    cacheStats: any;
    recommendations: string[];
    history: MemoryUsage[];
  } {
    const status = this.checkMemoryStatus();
    const cacheStats = this.getCacheStats();
    
    return {
      currentUsage: status.usage,
      status: status.status,
      cacheStats,
      recommendations: status.recommendations,
      history: this.getMemoryHistory().slice(-20), // 最近20条记录
    };
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.cacheRegistry.clear();
    this.memoryHistory = [];
    this.logger.info('内存管理器已销毁');
  }
}

/**
 * 内存泄漏检测器
 */
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private logger = Logger.getInstance();
  private objectRegistry = new WeakMap<object, string>();
  private creationCounts = new Map<string, number>();
  private destructionCounts = new Map<string, number>();

  private constructor() {}

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  /**
   * 注册对象创建
   */
  registerObjectCreation(obj: object, type: string): void {
    try {
      this.objectRegistry.set(obj, type);
      const count = this.creationCounts.get(type) || 0;
      this.creationCounts.set(type, count + 1);
    } catch (error) {
      this.logger.error('注册对象创建失败', error);
    }
  }

  /**
   * 注册对象销毁
   */
  registerObjectDestruction(obj: object): void {
    try {
      const type = this.objectRegistry.get(obj);
      if (type) {
        const count = this.destructionCounts.get(type) || 0;
        this.destructionCounts.set(type, count + 1);
        this.objectRegistry.delete(obj);
      }
    } catch (error) {
      this.logger.error('注册对象销毁失败', error);
    }
  }

  /**
   * 检测潜在的内存泄漏
   */
  detectLeaks(): {
    potentialLeaks: Array<{
      type: string;
      created: number;
      destroyed: number;
      leaked: number;
    }>;
    totalLeaked: number;
  } {
    const potentialLeaks: Array<{
      type: string;
      created: number;
      destroyed: number;
      leaked: number;
    }> = [];

    let totalLeaked = 0;

    for (const [type, created] of this.creationCounts.entries()) {
      const destroyed = this.destructionCounts.get(type) || 0;
      const leaked = created - destroyed;

      if (leaked > 0) {
        potentialLeaks.push({
          type,
          created,
          destroyed,
          leaked,
        });
        totalLeaked += leaked;
      }
    }

    return { potentialLeaks, totalLeaked };
  }

  /**
   * 生成泄漏报告
   */
  generateLeakReport(): {
    hasLeaks: boolean;
    leaks: any;
    recommendations: string[];
  } {
    const leaks = this.detectLeaks();
    const hasLeaks = leaks.totalLeaked > 0;
    const recommendations: string[] = [];

    if (hasLeaks) {
      recommendations.push('检测到潜在的内存泄漏');
      recommendations.push('确保在组件卸载时正确清理资源');
      recommendations.push('检查事件监听器是否正确移除');
      recommendations.push('验证定时器和异步操作是否正确取消');
    } else {
      recommendations.push('未检测到明显的内存泄漏');
    }

    return {
      hasLeaks,
      leaks,
      recommendations,
    };
  }

  /**
   * 重置检测器
   */
  reset(): void {
    this.creationCounts.clear();
    this.destructionCounts.clear();
    this.logger.info('内存泄漏检测器已重置');
  }
}

export default MemoryManager;