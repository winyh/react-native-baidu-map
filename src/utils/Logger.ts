import { BaiduMapError } from '../types';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFileLog: boolean;
  maxLogSize: number;
  logPrefix: string;
  enableTimestamp: boolean;
  enableStackTrace: boolean;
}

/**
 * 性能监控数据接口
 */
export interface PerformanceMetrics {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: BaiduMapError;
  metadata?: any;
}

/**
 * 调试和日志功能类
 * 提供可配置的日志输出、性能监控和调试信息
 */
export class Logger {
  private static instance: Logger;
  private static config: LoggerConfig = {
    level: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
    enableConsole: true,
    enableFileLog: false,
    maxLogSize: 1024 * 1024, // 1MB
    logPrefix: '[BaiduMap]',
    enableTimestamp: true,
    enableStackTrace: false,
  };

  private static logs: string[] = [];
  private static performanceMetrics: PerformanceMetrics[] = [];
  private static maxMetricsCount = 100;

  /**
   * 获取Logger单例实例
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 配置日志系统
   */
  static configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  static getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * 调试日志
   */
  static debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * 信息日志
   */
  static info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * 警告日志
   */
  static warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * 错误日志
   */
  static error(message: string, error?: any, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, error, ...args);
  }

  /**
   * 核心日志方法
   */
  private static log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.config.level) {
      return;
    }

    const timestamp = this.config.enableTimestamp ? new Date().toISOString() : '';
    const levelName = LogLevel[level];
    const prefix = `${this.config.logPrefix} [${levelName}]`;
    const fullMessage = `${timestamp ? `${timestamp} ` : ''}${prefix} ${message}`;

    // 控制台输出
    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(fullMessage, ...args);
          break;
        case LogLevel.INFO:
          console.info(fullMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(fullMessage, ...args);
          break;
        case LogLevel.ERROR:
          console.error(fullMessage, ...args);
          if (this.config.enableStackTrace && args[0] instanceof Error) {
            console.error(args[0].stack);
          }
          break;
      }
    }

    // 文件日志（如果启用）
    if (this.config.enableFileLog) {
      this.addToFileLog(fullMessage, args);
    }
  }

  /**
   * 添加到文件日志
   */
  private static addToFileLog(message: string, args: any[]): void {
    const logEntry = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;
    this.logs.push(logEntry);

    // 检查日志大小限制
    const totalSize = this.logs.join('\n').length;
    if (totalSize > this.config.maxLogSize) {
      // 删除旧日志，保留最新的一半
      const halfLength = Math.floor(this.logs.length / 2);
      this.logs = this.logs.slice(halfLength);
    }
  }

  /**
   * 获取所有日志
   */
  static getLogs(): string[] {
    return [...this.logs];
  }

  /**
   * 清除日志
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * 导出日志
   */
  static exportLogs(): string {
    return this.logs.join('\n');
  }

  /**
   * 性能监控 - 开始计时
   */
  static startPerformanceTimer(operation: string, metadata?: any): string {
    const timerId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now ? performance.now() : Date.now();
    
    // 存储计时信息
    (this as any)[`_timer_${timerId}`] = {
      operation,
      startTime,
      metadata,
    };

    this.debug(`Performance timer started: ${operation}`, { timerId, metadata });
    return timerId;
  }

  /**
   * 性能监控 - 结束计时
   */
  static endPerformanceTimer(timerId: string, success: boolean = true, error?: BaiduMapError): PerformanceMetrics | null {
    const timerData = (this as any)[`_timer_${timerId}`];
    if (!timerData) {
      this.warn(`Performance timer not found: ${timerId}`);
      return null;
    }

    const endTime = performance.now ? performance.now() : Date.now();
    const duration = endTime - timerData.startTime;

    const metrics: PerformanceMetrics = {
      operation: timerData.operation,
      startTime: timerData.startTime,
      endTime,
      duration,
      success,
      error,
      metadata: timerData.metadata,
    };

    // 添加到性能指标列表
    this.performanceMetrics.push(metrics);

    // 限制指标数量
    if (this.performanceMetrics.length > this.maxMetricsCount) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsCount);
    }

    // 清理计时器数据
    delete (this as any)[`_timer_${timerId}`];

    // 记录性能日志
    const logMessage = `Performance: ${timerData.operation} completed in ${duration.toFixed(2)}ms`;
    if (success) {
      this.info(logMessage, { success, duration, metadata: timerData.metadata });
    } else {
      this.warn(logMessage, { success, duration, error, metadata: timerData.metadata });
    }

    return metrics;
  }

  /**
   * 获取性能指标
   */
  static getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * 获取性能统计
   */
  static getPerformanceStats(): {
    totalOperations: number;
    successRate: number;
    averageDuration: number;
    slowestOperation: PerformanceMetrics | null;
    fastestOperation: PerformanceMetrics | null;
    operationStats: Record<string, {
      count: number;
      successRate: number;
      averageDuration: number;
      totalDuration: number;
    }>;
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        operationStats: {},
      };
    }

    const totalOperations = this.performanceMetrics.length;
    const successfulOperations = this.performanceMetrics.filter(m => m.success).length;
    const successRate = (successfulOperations / totalOperations) * 100;
    const totalDuration = this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / totalOperations;

    const sortedByDuration = [...this.performanceMetrics].sort((a, b) => a.duration - b.duration);
    const fastestOperation = sortedByDuration[0];
    const slowestOperation = sortedByDuration[sortedByDuration.length - 1];

    // 按操作类型统计
    const operationStats: Record<string, {
      count: number;
      successRate: number;
      averageDuration: number;
      totalDuration: number;
    }> = {};

    this.performanceMetrics.forEach(metric => {
      if (!operationStats[metric.operation]) {
        operationStats[metric.operation] = {
          count: 0,
          successRate: 0,
          averageDuration: 0,
          totalDuration: 0,
        };
      }

      const stats = operationStats[metric.operation];
      stats.count++;
      stats.totalDuration += metric.duration;
      if (metric.success) {
        stats.successRate++;
      }
    });

    // 计算每个操作的平均值和成功率
    Object.keys(operationStats).forEach(operation => {
      const stats = operationStats[operation];
      stats.averageDuration = stats.totalDuration / stats.count;
      stats.successRate = (stats.successRate / stats.count) * 100;
    });

    return {
      totalOperations,
      successRate,
      averageDuration,
      slowestOperation,
      fastestOperation,
      operationStats,
    };
  }

  /**
   * 清除性能指标
   */
  static clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }

  /**
   * 记录API调用
   */
  static logApiCall(method: string, params?: any, result?: any, error?: BaiduMapError): void {
    const logData = {
      method,
      params,
      result: result ? 'success' : 'error',
      error: error?.code,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      this.error(`API Call Failed: ${method}`, logData);
    } else {
      this.debug(`API Call: ${method}`, logData);
    }
  }

  /**
   * 记录组件生命周期
   */
  static logComponentLifecycle(component: string, lifecycle: string, props?: any): void {
    this.debug(`Component Lifecycle: ${component}.${lifecycle}`, { props });
  }

  /**
   * 记录用户交互
   */
  static logUserInteraction(interaction: string, data?: any): void {
    this.info(`User Interaction: ${interaction}`, data);
  }

  /**
   * 创建调试报告
   */
  static createDebugReport(): {
    config: LoggerConfig;
    logs: string[];
    performanceStats: any;
    systemInfo: any;
    timestamp: string;
  } {
    return {
      config: this.getConfig(),
      logs: this.getLogs(),
      performanceStats: this.getPerformanceStats(),
      systemInfo: this.getSystemInfo(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取系统信息
   */
  private static getSystemInfo(): any {
    const info: any = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
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
   * 设置最大性能指标数量
   */
  static setMaxMetricsCount(count: number): void {
    this.maxMetricsCount = Math.max(10, count);
    
    // 如果当前指标数量超过新限制，进行裁剪
    if (this.performanceMetrics.length > this.maxMetricsCount) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsCount);
    }
  }
}

// 全局声明，用于开发环境检测
declare const __DEV__: boolean;

export default Logger;