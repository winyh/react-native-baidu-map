import { Logger } from './Logger';
import { MemoryManager } from './MemoryManager';
import { RenderOptimizer, RenderPerformanceMonitor } from './RenderOptimizer';
import { NetworkOptimizer } from './NetworkOptimizer';

export interface DebugConfig {
  enableDebugPanel: boolean;
  enablePerformanceMonitor: boolean;
  enableMemoryMonitor: boolean;
  enableNetworkMonitor: boolean;
  enableLogViewer: boolean;
  autoRefreshInterval: number;
  maxLogEntries: number;
}

export interface DebugPanelState {
  isVisible: boolean;
  activeTab: 'performance' | 'memory' | 'network' | 'logs' | 'settings';
  performanceData: any;
  memoryData: any;
  networkData: any;
  logs: string[];
  settings: DebugConfig;
}

/**
 * 调试面板管理器
 * 提供可视化的调试界面和性能监控
 */
export class DebugPanel {
  private static instance: DebugPanel;
  private logger = Logger;
  private memoryManager = MemoryManager.getInstance();
  private renderOptimizer = RenderOptimizer.getInstance();
  private renderMonitor = RenderPerformanceMonitor.getInstance();
  private networkOptimizer = NetworkOptimizer.getInstance();

  private config: DebugConfig = {
    enableDebugPanel: __DEV__,
    enablePerformanceMonitor: true,
    enableMemoryMonitor: true,
    enableNetworkMonitor: true,
    enableLogViewer: true,
    autoRefreshInterval: 2000,
    maxLogEntries: 500,
  };

  private state: DebugPanelState = {
    isVisible: false,
    activeTab: 'performance',
    performanceData: null,
    memoryData: null,
    networkData: null,
    logs: [],
    settings: this.config,
  };

  private refreshTimer: any = null;
  private eventListeners: Array<(state: DebugPanelState) => void> = [];

  private constructor() {
    this.initializeDebugPanel();
  }

  /**
   * 获取调试面板单例
   */
  static getInstance(): DebugPanel {
    if (!DebugPanel.instance) {
      DebugPanel.instance = new DebugPanel();
    }
    return DebugPanel.instance;
  }

  /**
   * 配置调试面板
   */
  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
    this.state.settings = this.config;
    this.notifyStateChange();
    this.logger.info('调试面板配置已更新', this.config);
  }

  /**
   * 显示调试面板
   */
  show(): void {
    if (!this.config.enableDebugPanel) {
      this.logger.warn('调试面板已禁用');
      return;
    }

    this.state.isVisible = true;
    this.startAutoRefresh();
    this.refreshData();
    this.notifyStateChange();
    this.logger.info('调试面板已显示');
  }

  /**
   * 隐藏调试面板
   */
  hide(): void {
    this.state.isVisible = false;
    this.stopAutoRefresh();
    this.notifyStateChange();
    this.logger.info('调试面板已隐藏');
  }

  /**
   * 切换调试面板显示状态
   */
  toggle(): void {
    if (this.state.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 切换活动标签
   */
  setActiveTab(tab: DebugPanelState['activeTab']): void {
    this.state.activeTab = tab;
    this.refreshData();
    this.notifyStateChange();
  }

  /**
   * 获取当前状态
   */
  getState(): DebugPanelState {
    return { ...this.state };
  }

  /**
   * 添加状态变化监听器
   */
  addStateListener(listener: (state: DebugPanelState) => void): () => void {
    this.eventListeners.push(listener);
    
    // 返回取消监听的函数
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * 刷新数据
   */
  refreshData(): void {
    try {
      if (this.config.enablePerformanceMonitor) {
        this.refreshPerformanceData();
      }

      if (this.config.enableMemoryMonitor) {
        this.refreshMemoryData();
      }

      if (this.config.enableNetworkMonitor) {
        this.refreshNetworkData();
      }

      if (this.config.enableLogViewer) {
        this.refreshLogData();
      }

      this.notifyStateChange();

    } catch (error) {
      this.logger.error('刷新调试数据失败', error);
    }
  }

  /**
   * 刷新性能数据
   */
  private refreshPerformanceData(): void {
    const renderStats = this.renderOptimizer.getPerformanceStats();
    const renderHistory = this.renderMonitor.getPerformanceHistory();
    const renderReport = this.renderMonitor.generatePerformanceReport();

    this.state.performanceData = {
      currentFPS: renderStats.currentFPS,
      averageFPS: renderStats.averageFPS,
      droppedFrames: renderStats.droppedFrames,
      frameCount: renderStats.frameCount,
      isPerformanceGood: renderStats.isPerformanceGood,
      recommendations: renderStats.recommendations,
      history: renderHistory.slice(-20), // 最近20条记录
      report: renderReport,
      timestamp: Date.now(),
    };
  }

  /**
   * 刷新内存数据
   */
  private refreshMemoryData(): void {
    const memoryReport = this.memoryManager.generateMemoryReport();
    const cacheStats = this.memoryManager.getCacheStats();

    this.state.memoryData = {
      currentUsage: memoryReport.currentUsage,
      status: memoryReport.status,
      cacheStats,
      recommendations: memoryReport.recommendations,
      history: memoryReport.history,
      timestamp: Date.now(),
    };
  }

  /**
   * 刷新网络数据
   */
  private refreshNetworkData(): void {
    const networkMetrics = this.networkOptimizer.getNetworkMetrics();
    const optimizationReport = this.networkOptimizer.generateOptimizationReport();

    this.state.networkData = {
      metrics: networkMetrics,
      performance: optimizationReport.performance,
      recommendations: optimizationReport.recommendations,
      isOnline: networkMetrics.isOnline,
      offlineQueueSize: networkMetrics.offlineQueueSize,
      timestamp: Date.now(),
    };
  }

  /**
   * 刷新日志数据
   */
  private refreshLogData(): void {
    const logs = this.logger.getLogs();
    
    // 限制日志条数
    if (logs.length > this.config.maxLogEntries) {
      this.state.logs = logs.slice(-this.config.maxLogEntries);
    } else {
      this.state.logs = [...logs];
    }
  }

  /**
   * 开始自动刷新
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.refreshData();
    }, this.config.autoRefreshInterval);
  }

  /**
   * 停止自动刷新
   */
  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        this.logger.error('调试面板状态监听器执行失败', error);
      }
    });
  }

  /**
   * 初始化调试面板
   */
  private initializeDebugPanel(): void {
    if (!this.config.enableDebugPanel) {
      return;
    }

    // 在开发环境下自动启动性能监控
    if (__DEV__) {
      this.renderMonitor.startMonitoring();
    }

    this.logger.info('调试面板已初始化');
  }

  /**
   * 导出调试报告
   */
  exportDebugReport(): {
    timestamp: string;
    config: DebugConfig;
    performance: any;
    memory: any;
    network: any;
    logs: string[];
    systemInfo: any;
  } {
    this.refreshData();

    return {
      timestamp: new Date().toISOString(),
      config: this.config,
      performance: this.state.performanceData,
      memory: this.state.memoryData,
      network: this.state.networkData,
      logs: this.state.logs,
      systemInfo: this.getSystemInfo(),
    };
  }

  /**
   * 获取系统信息
   */
  private getSystemInfo(): any {
    const info: any = {
      userAgent: 'React Native',
      platform: 'React Native',
      timestamp: new Date().toISOString(),
    };

    // React Native 环境信息
    try {
      const { Platform } = require('react-native');
      info.reactNative = {
        OS: Platform.OS,
        Version: Platform.Version,
      };
    } catch (e) {
      // 非 React Native 环境
    }

    // 内存信息（如果可用）
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      info.memory = {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      };
    }

    return info;
  }

  /**
   * 清理调试数据
   */
  clearDebugData(): void {
    this.state.logs = [];
    this.logger.clearLogs();
    this.memoryManager.performCleanup();
    this.renderOptimizer.resetPerformanceStats();
    this.networkOptimizer.resetMetrics();
    this.renderMonitor.reset();
    
    this.refreshData();
    this.logger.info('调试数据已清理');
  }

  /**
   * 执行性能测试
   */
  async runPerformanceTest(): Promise<{
    success: boolean;
    results: {
      renderTest: any;
      memoryTest: any;
      networkTest: any;
    };
    recommendations: string[];
  }> {
    this.logger.info('开始执行性能测试');

    try {
      const results = {
        renderTest: await this.runRenderTest(),
        memoryTest: await this.runMemoryTest(),
        networkTest: await this.runNetworkTest(),
      };

      const recommendations = this.generateTestRecommendations(results);

      this.logger.info('性能测试完成', { results });

      return {
        success: true,
        results,
        recommendations,
      };

    } catch (error) {
      this.logger.error('性能测试失败', error);
      return {
        success: false,
        results: {
          renderTest: null,
          memoryTest: null,
          networkTest: null,
        },
        recommendations: ['性能测试执行失败，请检查系统状态'],
      };
    }
  }

  /**
   * 运行渲染测试
   */
  private async runRenderTest(): Promise<any> {
    const startTime = Date.now();
    
    // 模拟渲染压力测试
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      latitude: 39.9 + Math.random() * 0.1,
      longitude: 116.4 + Math.random() * 0.1,
    }));

    const optimizationResult = this.renderOptimizer.optimizeLargeDataset(
      testData,
      { north: 40, south: 39.8, east: 116.5, west: 116.3 },
      15,
      (item) => ({ latitude: item.latitude, longitude: item.longitude })
    );

    const endTime = Date.now();

    return {
      testDuration: endTime - startTime,
      originalCount: testData.length,
      optimizedCount: optimizationResult.optimizedItems.length,
      reductionRatio: optimizationResult.performanceMetrics.reductionRatio,
      processingTime: optimizationResult.performanceMetrics.processingTime,
    };
  }

  /**
   * 运行内存测试
   */
  private async runMemoryTest(): Promise<any> {
    const beforeUsage = this.memoryManager.getCurrentMemoryUsage();
    
    // 模拟内存压力测试
    const testData = Array.from({ length: 100 }, (_, i) => ({
      key: `test_${i}`,
      data: new Array(1000).fill(Math.random()),
    }));

    testData.forEach(item => {
      this.memoryManager.addToCache(item.key, item.data);
    });

    const afterUsage = this.memoryManager.getCurrentMemoryUsage();
    const cleanupResult = await this.memoryManager.performCleanup();

    return {
      beforeUsage,
      afterUsage,
      memoryIncrease: afterUsage && beforeUsage 
        ? afterUsage.usedJSHeapSize - beforeUsage.usedJSHeapSize 
        : 0,
      cleanupResult,
      cacheStats: this.memoryManager.getCacheStats(),
    };
  }

  /**
   * 运行网络测试
   */
  private async runNetworkTest(): Promise<any> {
    const startTime = Date.now();
    
    try {
      // 模拟网络请求测试
      const testUrl = 'https://httpbin.org/json';
      await this.networkOptimizer.optimizedFetch(testUrl);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        success: true,
        responseTime,
        cacheHit: false, // 第一次请求
        networkMetrics: this.networkOptimizer.getNetworkMetrics(),
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 生成测试建议
   */
  private generateTestRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    // 渲染测试建议
    if (results.renderTest) {
      if (results.renderTest.processingTime > 100) {
        recommendations.push('渲染优化处理时间较长，建议调整虚拟化参数');
      }
      if (results.renderTest.reductionRatio < 0.5) {
        recommendations.push('数据优化比例较低，建议启用更积极的LOD策略');
      }
    }

    // 内存测试建议
    if (results.memoryTest) {
      if (results.memoryTest.memoryIncrease > 10 * 1024 * 1024) { // 10MB
        recommendations.push('内存增长较大，建议优化缓存策略');
      }
      if (!results.memoryTest.cleanupResult.success) {
        recommendations.push('内存清理失败，需要检查清理逻辑');
      }
    }

    // 网络测试建议
    if (results.networkTest) {
      if (!results.networkTest.success) {
        recommendations.push('网络测试失败，检查网络连接和配置');
      } else if (results.networkTest.responseTime > 3000) {
        recommendations.push('网络响应时间较长，建议启用缓存和压缩');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('性能测试结果良好，系统运行正常');
    }

    return recommendations;
  }

  /**
   * 销毁调试面板
   */
  destroy(): void {
    this.hide();
    this.stopAutoRefresh();
    this.eventListeners = [];
    this.renderMonitor.destroy();
    this.logger.info('调试面板已销毁');
  }
}

/**
 * 错误追踪系统
 */
export class ErrorTracker {
  private static instance: ErrorTracker;
  private logger = Logger;
  
  private errors: Array<{
    id: string;
    timestamp: number;
    message: string;
    stack?: string;
    context?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
  }> = [];

  private errorHandlers: Array<(error: any) => void> = [];

  private constructor() {
    this.initializeErrorTracking();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * 初始化错误追踪
   */
  private initializeErrorTracking(): void {
    // React Native 环境中不使用 window API

    // React Native 错误处理
    try {
      const { ErrorUtils } = require('react-native');
      if (ErrorUtils) {
        const originalHandler = ErrorUtils.getGlobalHandler();
        ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
          this.trackError({
            message: error.message,
            stack: error.stack,
            context: { isFatal },
            severity: isFatal ? 'critical' : 'high',
          });
          
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
        });
      }
    } catch (e) {
      // 非 React Native 环境
    }
  }

  /**
   * 追踪错误
   */
  trackError(errorInfo: {
    message: string;
    stack?: string;
    context?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const error = {
      id: errorId,
      timestamp: Date.now(),
      message: errorInfo.message,
      stack: errorInfo.stack,
      context: errorInfo.context,
      severity: errorInfo.severity,
      resolved: false,
    };

    this.errors.push(error);

    // 限制错误记录数量
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-50);
    }

    // 记录到日志
    this.logger.error('错误追踪', error);

    // 通知错误处理器
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        this.logger.error('错误处理器执行失败', e);
      }
    });

    return errorId;
  }

  /**
   * 添加错误处理器
   */
  addErrorHandler(handler: (error: any) => void): () => void {
    this.errorHandlers.push(handler);
    
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 获取错误列表
   */
  getErrors(filter?: {
    severity?: string;
    resolved?: boolean;
    since?: number;
  }): Array<any> {
    let filteredErrors = [...this.errors];

    if (filter) {
      if (filter.severity) {
        filteredErrors = filteredErrors.filter(error => error.severity === filter.severity);
      }
      if (filter.resolved !== undefined) {
        filteredErrors = filteredErrors.filter(error => error.resolved === filter.resolved);
      }
      if (filter.since) {
        filteredErrors = filteredErrors.filter(error => error.timestamp >= (filter.since || 0));
      }
    }

    return filteredErrors.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 标记错误为已解决
   */
  resolveError(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      this.logger.info('错误已标记为解决', { errorId });
      return true;
    }
    return false;
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    recentErrors: number;
  } {
    const total = this.errors.length;
    const resolved = this.errors.filter(e => e.resolved).length;
    const unresolved = total - resolved;
    
    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentErrors = this.errors.filter(e => e.timestamp >= oneHourAgo).length;

    return {
      total,
      resolved,
      unresolved,
      bySeverity,
      recentErrors,
    };
  }

  /**
   * 清理错误记录
   */
  clearErrors(): void {
    this.errors = [];
    this.logger.info('错误记录已清理');
  }

  /**
   * 生成错误报告
   */
  generateErrorReport(): {
    timestamp: string;
    stats: any;
    recentErrors: any[];
    criticalErrors: any[];
    recommendations: string[];
  } {
    const stats = this.getErrorStats();
    const recentErrors = this.getErrors({ since: Date.now() - 24 * 60 * 60 * 1000 }); // 24小时内
    const criticalErrors = this.getErrors({ severity: 'critical', resolved: false });

    const recommendations: string[] = [];

    if (stats.unresolved > 10) {
      recommendations.push('未解决错误数量较多，建议及时处理');
    }

    if (criticalErrors.length > 0) {
      recommendations.push('存在严重错误，需要立即处理');
    }

    if (stats.recentErrors > 20) {
      recommendations.push('最近错误频率较高，建议检查系统稳定性');
    }

    return {
      timestamp: new Date().toISOString(),
      stats,
      recentErrors: recentErrors.slice(0, 10), // 最近10个错误
      criticalErrors,
      recommendations,
    };
  }
}

// 全局声明，用于开发环境检测
declare const __DEV__: boolean;

export default DebugPanel;