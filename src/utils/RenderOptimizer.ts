import { Logger } from './Logger';
import { MemoryManager } from './MemoryManager';

export interface RenderConfig {
  enableVirtualization: boolean;
  virtualWindowSize: number;
  enableLOD: boolean;
  lodLevels: LODLevel[];
  enableFrameRateMonitoring: boolean;
  targetFrameRate: number;
  enableBatching: boolean;
  batchSize: number;
}

export interface LODLevel {
  minZoom: number;
  maxZoom: number;
  maxMarkers: number;
  clusterThreshold: number;
  simplificationLevel: number;
}

export interface FrameMetrics {
  frameTime: number;
  fps: number;
  droppedFrames: number;
  timestamp: number;
}

export interface VirtualizationState {
  visibleItems: any[];
  totalItems: number;
  startIndex: number;
  endIndex: number;
  viewportBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * 渲染性能优化器
 * 提供虚拟化渲染、LOD优化、帧率监控等功能
 */
export class RenderOptimizer {
  private static instance: RenderOptimizer;
  private static logger = Logger;
  private memoryManager = MemoryManager.getInstance();

  private config: RenderConfig = {
    enableVirtualization: true,
    virtualWindowSize: 100,
    enableLOD: true,
    lodLevels: [
      { minZoom: 3, maxZoom: 8, maxMarkers: 50, clusterThreshold: 10, simplificationLevel: 0.8 },
      { minZoom: 9, maxZoom: 12, maxMarkers: 200, clusterThreshold: 5, simplificationLevel: 0.5 },
      { minZoom: 13, maxZoom: 16, maxMarkers: 500, clusterThreshold: 3, simplificationLevel: 0.2 },
      { minZoom: 17, maxZoom: 21, maxMarkers: 1000, clusterThreshold: 0, simplificationLevel: 0 },
    ],
    enableFrameRateMonitoring: true,
    targetFrameRate: 60,
    enableBatching: true,
    batchSize: 50,
  };

  private frameMetrics: FrameMetrics[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  private renderQueue: Array<() => void> = [];
  private isProcessingQueue = false;

  private constructor() {
    this.startFrameRateMonitoring();
  }

  /**
   * 获取渲染优化器单例
   */
  static getInstance(): RenderOptimizer {
    if (!RenderOptimizer.instance) {
      RenderOptimizer.instance = new RenderOptimizer();
    }
    return RenderOptimizer.instance;
  }

  /**
   * 配置渲染优化器
   */
  configure(config: Partial<RenderConfig>): void {
    this.config = { ...this.config, ...config };
    RenderOptimizer.logger.info('渲染优化器配置已更新', this.config);
  }

  /**
   * 虚拟化渲染 - 只渲染可见区域内的元素
   */
  virtualizeItems<T>(
    items: T[],
    viewportBounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    getItemBounds: (item: T) => {
      latitude: number;
      longitude: number;
    }
  ): VirtualizationState {
    if (!this.config.enableVirtualization) {
      return {
        visibleItems: items,
        totalItems: items.length,
        startIndex: 0,
        endIndex: items.length - 1,
        viewportBounds,
      };
    }

    const timerId = Logger.startPerformanceTimer('virtualization');

    try {
      // 过滤可见区域内的元素
      const visibleItems: T[] = [];
      let startIndex = -1;
      let endIndex = -1;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const bounds = getItemBounds(item);

        if (this.isItemInViewport(bounds, viewportBounds)) {
          if (startIndex === -1) {
            startIndex = i;
          }
          endIndex = i;
          visibleItems.push(item);

          // 限制可见元素数量
          if (visibleItems.length >= this.config.virtualWindowSize) {
            break;
          }
        }
      }

      Logger.endPerformanceTimer(timerId, true);

      return {
        visibleItems,
        totalItems: items.length,
        startIndex: startIndex === -1 ? 0 : startIndex,
        endIndex: endIndex === -1 ? 0 : endIndex,
        viewportBounds,
      };

    } catch (error) {
      Logger.endPerformanceTimer(timerId, false, error as any);
      Logger.error('虚拟化渲染失败', error);

      return {
        visibleItems: items.slice(0, this.config.virtualWindowSize),
        totalItems: items.length,
        startIndex: 0,
        endIndex: Math.min(this.config.virtualWindowSize - 1, items.length - 1),
        viewportBounds,
      };
    }
  }

  /**
   * LOD优化 - 根据缩放级别调整渲染质量
   */
  applyLOD<T>(
    items: T[],
    zoomLevel: number,
    simplifyItem?: (item: T, level: number) => T
  ): {
    optimizedItems: T[];
    lodLevel: LODLevel;
    clustered: boolean;
  } {
    if (!this.config.enableLOD) {
      return {
        optimizedItems: items,
        lodLevel: this.config.lodLevels[this.config.lodLevels.length - 1],
        clustered: false,
      };
    }

    const timerId = Logger.startPerformanceTimer('lod_optimization');

    try {
      // 找到适合当前缩放级别的LOD配置
      const lodLevel = this.config.lodLevels.find(
        level => zoomLevel >= level.minZoom && zoomLevel <= level.maxZoom
      ) || this.config.lodLevels[this.config.lodLevels.length - 1];

      let optimizedItems = [...items];
      let clustered = false;

      // 限制最大元素数量
      if (optimizedItems.length > lodLevel.maxMarkers) {
        optimizedItems = optimizedItems.slice(0, lodLevel.maxMarkers);
      }

      // 聚合处理
      if (lodLevel.clusterThreshold > 0 && optimizedItems.length > lodLevel.clusterThreshold) {
        optimizedItems = this.clusterItems(optimizedItems, lodLevel.clusterThreshold);
        clustered = true;
      }

      // 简化处理
      if (simplifyItem && lodLevel.simplificationLevel > 0) {
        optimizedItems = optimizedItems.map(item => 
          simplifyItem(item, lodLevel.simplificationLevel)
        );
      }

      Logger.endPerformanceTimer(timerId, true);

      return {
        optimizedItems,
        lodLevel,
        clustered,
      };

    } catch (error) {
      Logger.endPerformanceTimer(timerId, false, error as any);
      Logger.error('LOD优化失败', error);

      return {
        optimizedItems: items,
        lodLevel: this.config.lodLevels[0],
        clustered: false,
      };
    }
  }

  /**
   * 批量渲染 - 将渲染操作分批执行
   */
  batchRender(renderOperations: Array<() => void>): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.enableBatching) {
        renderOperations.forEach(op => op());
        resolve();
        return;
      }

      // 添加到渲染队列
      this.renderQueue.push(...renderOperations);

      if (!this.isProcessingQueue) {
        this.processRenderQueue().then(resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * 处理渲染队列
   */
  private async processRenderQueue(): Promise<void> {
    if (this.isProcessingQueue || this.renderQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const timerId = Logger.startPerformanceTimer('batch_render');

    try {
      while (this.renderQueue.length > 0) {
        const batch = this.renderQueue.splice(0, this.config.batchSize);
        
        // 执行批次
        batch.forEach(operation => {
          try {
            operation();
          } catch (error) {
            Logger.error('批量渲染操作失败', error);
          }
        });

        // 让出控制权，避免阻塞UI
        await this.nextFrame();
      }

      Logger.endPerformanceTimer(timerId, true);

    } catch (error) {
      Logger.endPerformanceTimer(timerId, false, error as any);
      Logger.error('批量渲染失败', error);

    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * 等待下一帧
   */
  private nextFrame(): Promise<void> {
    return new Promise(resolve => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 16); // ~60fps
      }
    });
  }

  /**
   * 聚合元素
   */
  private clusterItems<T>(items: T[], threshold: number): T[] {
    // 简单的聚合算法实现
    // 在实际应用中，可以使用更复杂的聚合算法
    const clustered: T[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      if (processed.has(i)) continue;

      const cluster = [items[i]];
      processed.add(i);

      // 查找附近的元素进行聚合
      for (let j = i + 1; j < items.length && cluster.length < threshold; j++) {
        if (!processed.has(j)) {
          cluster.push(items[j]);
          processed.add(j);
        }
      }

      // 如果聚合了多个元素，使用第一个作为代表
      clustered.push(cluster[0]);
    }

    return clustered;
  }

  /**
   * 检查元素是否在视口内
   */
  private isItemInViewport(
    itemBounds: { latitude: number; longitude: number },
    viewportBounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }
  ): boolean {
    return (
      itemBounds.latitude <= viewportBounds.north &&
      itemBounds.latitude >= viewportBounds.south &&
      itemBounds.longitude <= viewportBounds.east &&
      itemBounds.longitude >= viewportBounds.west
    );
  }

  /**
   * 开始帧率监控
   */
  private startFrameRateMonitoring(): void {
    if (!this.config.enableFrameRateMonitoring) return;

    const monitor = () => {
      const now = performance.now ? performance.now() : Date.now();
      
      if (this.lastFrameTime > 0) {
        const frameTime = now - this.lastFrameTime;
        const fps = 1000 / frameTime;
        
        // 检测掉帧
        if (frameTime > (1000 / this.config.targetFrameRate) * 1.5) {
          this.droppedFrames++;
        }

        this.frameMetrics.push({
          frameTime,
          fps,
          droppedFrames: this.droppedFrames,
          timestamp: now,
        });

        // 保持指标历史在合理范围内
        if (this.frameMetrics.length > 100) {
          this.frameMetrics = this.frameMetrics.slice(-50);
        }
      }

      this.lastFrameTime = now;
      this.frameCount++;

      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(monitor);
      } else {
        setTimeout(monitor, 16);
      }
    };

    monitor();
  }

  /**
   * 获取当前帧率
   */
  getCurrentFPS(): number {
    if (this.frameMetrics.length < 2) return 0;

    const recent = this.frameMetrics.slice(-10);
    const avgFrameTime = recent.reduce((sum, metric) => sum + metric.frameTime, 0) / recent.length;
    return 1000 / avgFrameTime;
  }

  /**
   * 获取帧率历史
   */
  getFrameMetrics(): FrameMetrics[] {
    return [...this.frameMetrics];
  }

  /**
   * 获取渲染性能统计
   */
  getPerformanceStats(): {
    currentFPS: number;
    averageFPS: number;
    droppedFrames: number;
    frameCount: number;
    isPerformanceGood: boolean;
    recommendations: string[];
  } {
    const currentFPS = this.getCurrentFPS();
    const averageFPS = this.frameMetrics.length > 0
      ? this.frameMetrics.reduce((sum, metric) => sum + metric.fps, 0) / this.frameMetrics.length
      : 0;

    const isPerformanceGood = currentFPS >= this.config.targetFrameRate * 0.8;
    const recommendations: string[] = [];

    if (!isPerformanceGood) {
      recommendations.push('当前帧率低于目标值，建议优化渲染性能');
      recommendations.push('考虑启用虚拟化渲染减少渲染元素');
      recommendations.push('使用LOD优化减少复杂度');
      recommendations.push('启用批量渲染避免频繁更新');
    }

    if (this.droppedFrames > this.frameCount * 0.1) {
      recommendations.push('掉帧率较高，检查是否有阻塞主线程的操作');
    }

    return {
      currentFPS,
      averageFPS,
      droppedFrames: this.droppedFrames,
      frameCount: this.frameCount,
      isPerformanceGood,
      recommendations,
    };
  }

  /**
   * 重置性能统计
   */
  resetPerformanceStats(): void {
    this.frameMetrics = [];
    this.frameCount = 0;
    this.droppedFrames = 0;
    this.lastFrameTime = 0;
    Logger.info('渲染性能统计已重置');
  }

  /**
   * 优化大数据量渲染
   */
  optimizeLargeDataset<T>(
    items: T[],
    viewportBounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    zoomLevel: number,
    getItemBounds: (item: T) => { latitude: number; longitude: number },
    simplifyItem?: (item: T, level: number) => T
  ): {
    optimizedItems: T[];
    virtualizationState: VirtualizationState;
    lodResult: any;
    performanceMetrics: {
      originalCount: number;
      optimizedCount: number;
      reductionRatio: number;
      processingTime: number;
    };
  } {
    const timerId = Logger.startPerformanceTimer('large_dataset_optimization');
    const startTime = performance.now ? performance.now() : Date.now();

    try {
      // 1. 首先应用LOD优化
      const lodResult = this.applyLOD(items, zoomLevel, simplifyItem);
      
      // 2. 然后应用虚拟化
      const virtualizationState = this.virtualizeItems(
        lodResult.optimizedItems,
        viewportBounds,
        getItemBounds
      );

      const endTime = performance.now ? performance.now() : Date.now();
      const processingTime = endTime - startTime;

      const performanceMetrics = {
        originalCount: items.length,
        optimizedCount: virtualizationState.visibleItems.length,
        reductionRatio: items.length > 0 
          ? (items.length - virtualizationState.visibleItems.length) / items.length 
          : 0,
        processingTime,
      };

      Logger.endPerformanceTimer(timerId, true);

      return {
        optimizedItems: virtualizationState.visibleItems,
        virtualizationState,
        lodResult,
        performanceMetrics,
      };

    } catch (error) {
      Logger.endPerformanceTimer(timerId, false, error as any);
      Logger.error('大数据量优化失败', error);

      const endTime = performance.now ? performance.now() : Date.now();
      
      return {
        optimizedItems: items.slice(0, 100), // 降级处理
        virtualizationState: {
          visibleItems: items.slice(0, 100),
          totalItems: items.length,
          startIndex: 0,
          endIndex: Math.min(99, items.length - 1),
          viewportBounds,
        },
        lodResult: {
          optimizedItems: items.slice(0, 100),
          lodLevel: this.config.lodLevels[0],
          clustered: false,
        },
        performanceMetrics: {
          originalCount: items.length,
          optimizedCount: Math.min(100, items.length),
          reductionRatio: items.length > 100 ? 0.9 : 0,
          processingTime: endTime - startTime,
        },
      };
    }
  }

  /**
   * 自适应性能调整
   */
  adaptivePerformanceAdjustment(): void {
    const stats = this.getPerformanceStats();
    
    if (!stats.isPerformanceGood) {
      // 性能不佳时自动调整配置
      if (stats.currentFPS < this.config.targetFrameRate * 0.5) {
        // 严重性能问题
        this.config.virtualWindowSize = Math.max(20, this.config.virtualWindowSize * 0.5);
        this.config.batchSize = Math.max(10, this.config.batchSize * 0.5);
        Logger.warn('检测到严重性能问题，自动降低渲染质量');
      } else if (stats.currentFPS < this.config.targetFrameRate * 0.8) {
        // 轻微性能问题
        this.config.virtualWindowSize = Math.max(50, this.config.virtualWindowSize * 0.8);
        this.config.batchSize = Math.max(25, this.config.batchSize * 0.8);
        Logger.info('检测到性能问题，适度调整渲染参数');
      }
    } else if (stats.currentFPS > this.config.targetFrameRate * 0.95) {
      // 性能良好时可以适当提高质量
      this.config.virtualWindowSize = Math.min(200, this.config.virtualWindowSize * 1.1);
      this.config.batchSize = Math.min(100, this.config.batchSize * 1.1);
    }
  }

  /**
   * 生成渲染优化报告
   */
  generateOptimizationReport(): {
    config: RenderConfig;
    performanceStats: any;
    memoryUsage: any;
    recommendations: string[];
    optimizationSuggestions: string[];
  } {
    const performanceStats = this.getPerformanceStats();
    const memoryReport = this.memoryManager.generateMemoryReport();
    const recommendations: string[] = [];
    const optimizationSuggestions: string[] = [];

    // 性能建议
    if (!performanceStats.isPerformanceGood) {
      recommendations.push(...performanceStats.recommendations);
    }

    // 内存建议
    if (memoryReport.status !== 'normal') {
      recommendations.push(...memoryReport.recommendations);
    }

    // 优化建议
    if (this.config.enableVirtualization) {
      optimizationSuggestions.push('虚拟化渲染已启用，有助于处理大量元素');
    } else {
      optimizationSuggestions.push('建议启用虚拟化渲染以提高大数据集性能');
    }

    if (this.config.enableLOD) {
      optimizationSuggestions.push('LOD优化已启用，根据缩放级别调整渲染质量');
    } else {
      optimizationSuggestions.push('建议启用LOD优化以提高不同缩放级别的性能');
    }

    if (this.config.enableBatching) {
      optimizationSuggestions.push('批量渲染已启用，减少渲染调用频率');
    } else {
      optimizationSuggestions.push('建议启用批量渲染以减少渲染开销');
    }

    return {
      config: this.config,
      performanceStats,
      memoryUsage: memoryReport,
      recommendations,
      optimizationSuggestions,
    };
  }

  /**
   * 销毁渲染优化器
   */
  destroy(): void {
    this.renderQueue = [];
    this.frameMetrics = [];
    this.isProcessingQueue = false;
    Logger.info('渲染优化器已销毁');
  }
}

/**
 * 渲染性能监控器
 */
export class RenderPerformanceMonitor {
  private static instance: RenderPerformanceMonitor;
  // private logger = Logger.getInstance(); // 已改为静态调用
  private renderOptimizer = RenderOptimizer.getInstance();
  
  private monitoringInterval: any = null;
  private performanceHistory: Array<{
    timestamp: number;
    fps: number;
    memoryUsage: number;
    renderTime: number;
  }> = [];

  private constructor() {}

  static getInstance(): RenderPerformanceMonitor {
    if (!RenderPerformanceMonitor.instance) {
      RenderPerformanceMonitor.instance = new RenderPerformanceMonitor();
    }
    return RenderPerformanceMonitor.instance;
  }

  /**
   * 开始性能监控
   */
  startMonitoring(interval: number = 5000): void {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceData();
    }, interval);

    Logger.info('渲染性能监控已启动', { interval });
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      Logger.info('渲染性能监控已停止');
    }
  }

  /**
   * 收集性能数据
   */
  private collectPerformanceData(): void {
    try {
      const fps = this.renderOptimizer.getCurrentFPS();
      const memoryUsage = this.getMemoryUsage();
      const renderTime = this.measureRenderTime();

      this.performanceHistory.push({
        timestamp: Date.now(),
        fps,
        memoryUsage,
        renderTime,
      });

      // 保持历史记录在合理范围内
      if (this.performanceHistory.length > 100) {
        this.performanceHistory = this.performanceHistory.slice(-50);
      }

      // 检查性能异常
      this.checkPerformanceAnomalies(fps, memoryUsage, renderTime);

    } catch (error) {
      Logger.error('收集性能数据失败', error);
    }
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    try {
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 测量渲染时间
   */
  private measureRenderTime(): number {
    // 这里可以实现更复杂的渲染时间测量逻辑
    const frameMetrics = this.renderOptimizer.getFrameMetrics();
    if (frameMetrics.length > 0) {
      return frameMetrics[frameMetrics.length - 1].frameTime;
    }
    return 0;
  }

  /**
   * 检查性能异常
   */
  private checkPerformanceAnomalies(fps: number, memoryUsage: number, renderTime: number): void {
    const warnings: string[] = [];

    if (fps < 30) {
      warnings.push(`帧率过低: ${fps.toFixed(1)} FPS`);
    }

    if (memoryUsage > 100) {
      warnings.push(`内存使用过高: ${memoryUsage.toFixed(1)} MB`);
    }

    if (renderTime > 33) { // 超过33ms表示低于30fps
      warnings.push(`渲染时间过长: ${renderTime.toFixed(1)} ms`);
    }

    if (warnings.length > 0) {
      Logger.warn('检测到性能异常', { warnings, fps, memoryUsage, renderTime });
      
      // 触发自适应调整
      this.renderOptimizer.adaptivePerformanceAdjustment();
    }
  }

  /**
   * 获取性能历史
   */
  getPerformanceHistory(): Array<{
    timestamp: number;
    fps: number;
    memoryUsage: number;
    renderTime: number;
  }> {
    return [...this.performanceHistory];
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): {
    summary: {
      averageFPS: number;
      averageMemoryUsage: number;
      averageRenderTime: number;
      performanceScore: number;
    };
    trends: {
      fpsTrend: 'improving' | 'stable' | 'declining';
      memoryTrend: 'improving' | 'stable' | 'declining';
    };
    recommendations: string[];
  } {
    if (this.performanceHistory.length === 0) {
      return {
        summary: {
          averageFPS: 0,
          averageMemoryUsage: 0,
          averageRenderTime: 0,
          performanceScore: 0,
        },
        trends: {
          fpsTrend: 'stable',
          memoryTrend: 'stable',
        },
        recommendations: ['暂无性能数据'],
      };
    }

    const recent = this.performanceHistory.slice(-20);
    const averageFPS = recent.reduce((sum, data) => sum + data.fps, 0) / recent.length;
    const averageMemoryUsage = recent.reduce((sum, data) => sum + data.memoryUsage, 0) / recent.length;
    const averageRenderTime = recent.reduce((sum, data) => sum + data.renderTime, 0) / recent.length;

    // 计算性能分数 (0-100)
    const fpsScore = Math.min(100, (averageFPS / 60) * 100);
    const memoryScore = Math.max(0, 100 - (averageMemoryUsage / 100) * 100);
    const renderTimeScore = Math.max(0, 100 - (averageRenderTime / 33) * 100);
    const performanceScore = (fpsScore + memoryScore + renderTimeScore) / 3;

    // 分析趋势
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));

    const firstHalfFPS = firstHalf.reduce((sum, data) => sum + data.fps, 0) / firstHalf.length;
    const secondHalfFPS = secondHalf.reduce((sum, data) => sum + data.fps, 0) / secondHalf.length;
    const fpsChange = secondHalfFPS - firstHalfFPS;

    const firstHalfMemory = firstHalf.reduce((sum, data) => sum + data.memoryUsage, 0) / firstHalf.length;
    const secondHalfMemory = secondHalf.reduce((sum, data) => sum + data.memoryUsage, 0) / secondHalf.length;
    const memoryChange = secondHalfMemory - firstHalfMemory;

    const fpsThreshold = 2;
    const memoryThreshold = 5;

    const fpsTrend = fpsChange > fpsThreshold ? 'improving' : 
                     fpsChange < -fpsThreshold ? 'declining' : 'stable';
    const memoryTrend = memoryChange < -memoryThreshold ? 'improving' : 
                        memoryChange > memoryThreshold ? 'declining' : 'stable';

    // 生成建议
    const recommendations: string[] = [];
    
    if (performanceScore < 60) {
      recommendations.push('整体性能较差，建议进行全面优化');
    } else if (performanceScore < 80) {
      recommendations.push('性能有待提升，建议针对性优化');
    }

    if (fpsScore < 70) {
      recommendations.push('帧率偏低，建议启用渲染优化功能');
    }

    if (memoryScore < 70) {
      recommendations.push('内存使用偏高，建议进行内存优化');
    }

    if (fpsTrend === 'declining') {
      recommendations.push('帧率呈下降趋势，需要关注性能退化');
    }

    if (memoryTrend === 'declining') {
      recommendations.push('内存使用呈上升趋势，可能存在内存泄漏');
    }

    return {
      summary: {
        averageFPS,
        averageMemoryUsage,
        averageRenderTime,
        performanceScore,
      },
      trends: {
        fpsTrend,
        memoryTrend,
      },
      recommendations,
    };
  }

  /**
   * 重置监控数据
   */
  reset(): void {
    this.performanceHistory = [];
    Logger.info('性能监控数据已重置');
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stopMonitoring();
    this.performanceHistory = [];
    Logger.info('渲染性能监控器已销毁');
  }
}

export default RenderOptimizer;
