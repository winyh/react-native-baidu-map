import { Logger } from './Logger';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: string;
  message: string;
  data?: any;
  category?: string;
  source?: string;
}

export interface LogFilter {
  level?: string[];
  category?: string[];
  source?: string[];
  timeRange?: {
    start: number;
    end: number;
  };
  searchText?: string;
}

export interface LogVisualizationConfig {
  maxEntries: number;
  autoScroll: boolean;
  enableSearch: boolean;
  enableFilter: boolean;
  enableExport: boolean;
  refreshInterval: number;
  colorScheme: 'light' | 'dark' | 'auto';
}

/**
 * 日志可视化管理器
 * 提供日志的可视化展示和分析功能
 */
export class LogVisualization {
  private static instance: LogVisualization;
  private logger = Logger;

  private config: LogVisualizationConfig = {
    maxEntries: 1000,
    autoScroll: true,
    enableSearch: true,
    enableFilter: true,
    enableExport: true,
    refreshInterval: 1000,
    colorScheme: 'auto',
  };

  private logEntries: LogEntry[] = [];
  private filteredEntries: LogEntry[] = [];
  private currentFilter: LogFilter = {};
  private searchText = '';
  private refreshTimer: any = null;
  private eventListeners: Array<(entries: LogEntry[]) => void> = [];

  private constructor() {
    this.initializeLogVisualization();
  }

  /**
   * 获取日志可视化单例
   */
  static getInstance(): LogVisualization {
    if (!LogVisualization.instance) {
      LogVisualization.instance = new LogVisualization();
    }
    return LogVisualization.instance;
  }

  /**
   * 配置日志可视化
   */
  configure(config: Partial<LogVisualizationConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('日志可视化配置已更新', this.config);
  }

  /**
   * 初始化日志可视化
   */
  private initializeLogVisualization(): void {
    // 开始定期刷新日志
    this.startAutoRefresh();
    
    // 初始加载日志
    this.refreshLogs();
  }

  /**
   * 开始自动刷新
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.refreshLogs();
    }, this.config.refreshInterval);
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
   * 刷新日志
   */
  refreshLogs(): void {
    try {
      const rawLogs = this.logger.getLogs();
      
      // 转换为LogEntry格式
      const newEntries: LogEntry[] = rawLogs.map((log, index) => {
        const parsed = this.parseLogEntry(log, index);
        return parsed;
      });

      // 限制日志条数
      if (newEntries.length > this.config.maxEntries) {
        this.logEntries = newEntries.slice(-this.config.maxEntries);
      } else {
        this.logEntries = newEntries;
      }

      // 应用过滤器
      this.applyFilter();

    } catch (error) {
      this.logger.error('刷新日志失败', error);
    }
  }

  /**
   * 解析日志条目
   */
  private parseLogEntry(logString: string, index: number): LogEntry {
    try {
      // 尝试解析结构化日志
      const timestampMatch = logString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
      const levelMatch = logString.match(/\[(DEBUG|INFO|WARN|ERROR)\]/);
      
      let timestamp = Date.now();
      let level = 'INFO';
      let message = logString;
      let data: any = undefined;
      let category = 'general';
      let source = 'unknown';

      if (timestampMatch) {
        timestamp = new Date(timestampMatch[1]).getTime();
      }

      if (levelMatch) {
        level = levelMatch[1];
      }

      // 提取消息内容
      const messageMatch = logString.match(/\[.*?\]\s+(.+)/);
      if (messageMatch) {
        message = messageMatch[1];
      }

      // 尝试提取JSON数据
      const jsonMatch = message.match(/\{.*\}$/);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[0]);
          message = message.replace(jsonMatch[0], '').trim();
        } catch (e) {
          // JSON解析失败，保持原样
        }
      }

      // 确定分类
      if (message.includes('地图') || message.includes('Map')) {
        category = 'map';
      } else if (message.includes('定位') || message.includes('Location')) {
        category = 'location';
      } else if (message.includes('网络') || message.includes('Network')) {
        category = 'network';
      } else if (message.includes('内存') || message.includes('Memory')) {
        category = 'memory';
      } else if (message.includes('性能') || message.includes('Performance')) {
        category = 'performance';
      } else if (message.includes('错误') || message.includes('Error')) {
        category = 'error';
      }

      // 确定来源
      if (message.includes('BaiduMap')) {
        source = 'BaiduMap';
      } else if (message.includes('React')) {
        source = 'React';
      } else if (message.includes('Native')) {
        source = 'Native';
      }

      return {
        id: `log_${timestamp}_${index}`,
        timestamp,
        level,
        message,
        data,
        category,
        source,
      };

    } catch (error) {
      // 解析失败时返回基本格式
      return {
        id: `log_${Date.now()}_${index}`,
        timestamp: Date.now(),
        level: 'INFO',
        message: logString,
        category: 'general',
        source: 'unknown',
      };
    }
  }

  /**
   * 应用过滤器
   */
  private applyFilter(): void {
    let filtered = [...this.logEntries];

    // 级别过滤
    if (this.currentFilter.level && this.currentFilter.level.length > 0) {
      filtered = filtered.filter(entry => 
        this.currentFilter.level!.includes(entry.level)
      );
    }

    // 分类过滤
    if (this.currentFilter.category && this.currentFilter.category.length > 0) {
      filtered = filtered.filter(entry => 
        this.currentFilter.category!.includes(entry.category || 'general')
      );
    }

    // 来源过滤
    if (this.currentFilter.source && this.currentFilter.source.length > 0) {
      filtered = filtered.filter(entry => 
        this.currentFilter.source!.includes(entry.source || 'unknown')
      );
    }

    // 时间范围过滤
    if (this.currentFilter.timeRange) {
      const { start, end } = this.currentFilter.timeRange;
      filtered = filtered.filter(entry => 
        entry.timestamp >= start && entry.timestamp <= end
      );
    }

    // 搜索文本过滤
    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.message.toLowerCase().includes(searchLower) ||
        (entry.data && JSON.stringify(entry.data).toLowerCase().includes(searchLower))
      );
    }

    this.filteredEntries = filtered;
    this.notifyListeners();
  }

  /**
   * 设置过滤器
   */
  setFilter(filter: LogFilter): void {
    this.currentFilter = { ...filter };
    this.applyFilter();
  }

  /**
   * 设置搜索文本
   */
  setSearchText(text: string): void {
    this.searchText = text;
    this.applyFilter();
  }

  /**
   * 获取过滤后的日志条目
   */
  getFilteredEntries(): LogEntry[] {
    return [...this.filteredEntries];
  }

  /**
   * 获取所有日志条目
   */
  getAllEntries(): LogEntry[] {
    return [...this.logEntries];
  }

  /**
   * 获取日志统计信息
   */
  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    timeRange: {
      earliest: number;
      latest: number;
    };
  } {
    const total = this.logEntries.length;
    const byLevel: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    
    let earliest = Infinity;
    let latest = -Infinity;

    this.logEntries.forEach(entry => {
      // 统计级别
      byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
      
      // 统计分类
      const category = entry.category || 'general';
      byCategory[category] = (byCategory[category] || 0) + 1;
      
      // 统计来源
      const source = entry.source || 'unknown';
      bySource[source] = (bySource[source] || 0) + 1;
      
      // 更新时间范围
      if (entry.timestamp < earliest) earliest = entry.timestamp;
      if (entry.timestamp > latest) latest = entry.timestamp;
    });

    return {
      total,
      byLevel,
      byCategory,
      bySource,
      timeRange: {
        earliest: earliest === Infinity ? 0 : earliest,
        latest: latest === -Infinity ? 0 : latest,
      },
    };
  }

  /**
   * 添加事件监听器
   */
  addListener(listener: (entries: LogEntry[]) => void): () => void {
    this.eventListeners.push(listener);
    
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(this.filteredEntries);
      } catch (error) {
        this.logger.error('日志监听器执行失败', error);
      }
    });
  }

  /**
   * 导出日志
   */
  exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    const entries = this.filteredEntries.length > 0 ? this.filteredEntries : this.logEntries;

    switch (format) {
      case 'json':
        return JSON.stringify(entries, null, 2);
      
      case 'csv':
        return this.exportToCSV(entries);
      
      case 'txt':
        return this.exportToText(entries);
      
      default:
        return JSON.stringify(entries, null, 2);
    }
  }

  /**
   * 导出为CSV格式
   */
  private exportToCSV(entries: LogEntry[]): string {
    const headers = ['Timestamp', 'Level', 'Category', 'Source', 'Message', 'Data'];
    const csvRows = [headers.join(',')];

    entries.forEach(entry => {
      const row = [
        new Date(entry.timestamp).toISOString(),
        entry.level,
        entry.category || '',
        entry.source || '',
        `"${entry.message.replace(/"/g, '""')}"`, // 转义双引号
        entry.data ? `"${JSON.stringify(entry.data).replace(/"/g, '""')}"` : '',
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * 导出为文本格式
   */
  private exportToText(entries: LogEntry[]): string {
    return entries.map(entry => {
      const timestamp = new Date(entry.timestamp).toISOString();
      const dataStr = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : '';
      return `[${timestamp}] [${entry.level}] [${entry.category}] [${entry.source}] ${entry.message}${dataStr}`;
    }).join('\n');
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logEntries = [];
    this.filteredEntries = [];
    this.logger.clearLogs();
    this.notifyListeners();
    this.logger.info('日志已清空');
  }

  /**
   * 获取日志级别颜色
   */
  getLevelColor(level: string): string {
    const colors = {
      DEBUG: '#6c757d',
      INFO: '#17a2b8',
      WARN: '#ffc107',
      ERROR: '#dc3545',
    };
    return colors[level as keyof typeof colors] || '#6c757d';
  }

  /**
   * 获取分类颜色
   */
  getCategoryColor(category: string): string {
    const colors = {
      map: '#007bff',
      location: '#28a745',
      network: '#fd7e14',
      memory: '#6f42c1',
      performance: '#e83e8c',
      error: '#dc3545',
      general: '#6c757d',
    };
    return colors[category as keyof typeof colors] || '#6c757d';
  }

  /**
   * 格式化时间戳
   */
  formatTimestamp(timestamp: number, format: 'full' | 'time' | 'relative' = 'full'): string {
    const date = new Date(timestamp);
    
    switch (format) {
      case 'full':
        return date.toISOString();
      
      case 'time':
        return date.toLocaleTimeString();
      
      case 'relative':
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 1000) return '刚刚';
        if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        return `${Math.floor(diff / 86400000)}天前`;
      
      default:
        return date.toISOString();
    }
  }

  /**
   * 搜索日志
   */
  searchLogs(query: string, options?: {
    caseSensitive?: boolean;
    regex?: boolean;
    includeData?: boolean;
  }): LogEntry[] {
    const opts = {
      caseSensitive: false,
      regex: false,
      includeData: true,
      ...options,
    };

    let searchFn: (text: string) => boolean;

    if (opts.regex) {
      try {
        const regex = new RegExp(query, opts.caseSensitive ? 'g' : 'gi');
        searchFn = (text: string) => regex.test(text);
      } catch (error) {
        // 正则表达式无效，回退到普通搜索
        const searchText = opts.caseSensitive ? query : query.toLowerCase();
        searchFn = (text: string) => {
          const targetText = opts.caseSensitive ? text : text.toLowerCase();
          return targetText.includes(searchText);
        };
      }
    } else {
      const searchText = opts.caseSensitive ? query : query.toLowerCase();
      searchFn = (text: string) => {
        const targetText = opts.caseSensitive ? text : text.toLowerCase();
        return targetText.includes(searchText);
      };
    }

    return this.logEntries.filter(entry => {
      // 搜索消息
      if (searchFn(entry.message)) return true;
      
      // 搜索数据（如果启用）
      if (opts.includeData && entry.data) {
        try {
          const dataStr = JSON.stringify(entry.data);
          if (searchFn(dataStr)) return true;
        } catch (error) {
          // JSON序列化失败，忽略
        }
      }
      
      return false;
    });
  }

  /**
   * 获取日志趋势
   */
  getLogTrends(timeWindow: number = 3600000): {
    timeline: Array<{
      timestamp: number;
      count: number;
      byLevel: Record<string, number>;
    }>;
    summary: {
      totalInWindow: number;
      averagePerMinute: number;
      peakTime: number;
      peakCount: number;
    };
  } {
    const now = Date.now();
    const startTime = now - timeWindow;
    const windowEntries = this.logEntries.filter(entry => entry.timestamp >= startTime);
    
    // 按分钟分组
    const minuteGroups: Record<number, LogEntry[]> = {};
    windowEntries.forEach(entry => {
      const minute = Math.floor(entry.timestamp / 60000) * 60000;
      if (!minuteGroups[minute]) {
        minuteGroups[minute] = [];
      }
      minuteGroups[minute].push(entry);
    });

    // 生成时间线
    const timeline = Object.keys(minuteGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .map(minute => {
        const entries = minuteGroups[minute];
        const byLevel: Record<string, number> = {};
        
        entries.forEach(entry => {
          byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
        });

        return {
          timestamp: minute,
          count: entries.length,
          byLevel,
        };
      });

    // 计算摘要
    const totalInWindow = windowEntries.length;
    const windowMinutes = timeWindow / 60000;
    const averagePerMinute = totalInWindow / windowMinutes;
    
    let peakTime = 0;
    let peakCount = 0;
    timeline.forEach(point => {
      if (point.count > peakCount) {
        peakCount = point.count;
        peakTime = point.timestamp;
      }
    });

    return {
      timeline,
      summary: {
        totalInWindow,
        averagePerMinute,
        peakTime,
        peakCount,
      },
    };
  }

  /**
   * 销毁日志可视化
   */
  destroy(): void {
    this.stopAutoRefresh();
    this.eventListeners = [];
    this.logEntries = [];
    this.filteredEntries = [];
    this.logger.info('日志可视化已销毁');
  }
}

/**
 * 日志分析器
 */
export class LogAnalyzer {
  private static instance: LogAnalyzer;
  private logger = Logger;
  private logVisualization = LogVisualization.getInstance();

  private constructor() {}

  static getInstance(): LogAnalyzer {
    if (!LogAnalyzer.instance) {
      LogAnalyzer.instance = new LogAnalyzer();
    }
    return LogAnalyzer.instance;
  }

  /**
   * 分析日志模式
   */
  analyzePatterns(): {
    errorPatterns: Array<{
      pattern: string;
      count: number;
      examples: LogEntry[];
    }>;
    performanceIssues: Array<{
      issue: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      affectedLogs: LogEntry[];
    }>;
    recommendations: string[];
  } {
    const entries = this.logVisualization.getAllEntries();
    const errorPatterns = this.findErrorPatterns(entries);
    const performanceIssues = this.findPerformanceIssues(entries);
    const recommendations = this.generateRecommendations(errorPatterns, performanceIssues);

    return {
      errorPatterns,
      performanceIssues,
      recommendations,
    };
  }

  /**
   * 查找错误模式
   */
  private findErrorPatterns(entries: LogEntry[]): Array<{
    pattern: string;
    count: number;
    examples: LogEntry[];
  }> {
    const errorEntries = entries.filter(entry => entry.level === 'ERROR');
    const patterns: Record<string, LogEntry[]> = {};

    errorEntries.forEach(entry => {
      // 简化错误消息以找到模式
      const pattern = this.simplifyErrorMessage(entry.message);
      if (!patterns[pattern]) {
        patterns[pattern] = [];
      }
      patterns[pattern].push(entry);
    });

    return Object.entries(patterns)
      .map(([pattern, logs]) => ({
        pattern,
        count: logs.length,
        examples: logs.slice(0, 3), // 最多3个示例
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 简化错误消息
   */
  private simplifyErrorMessage(message: string): string {
    // 移除具体的数值、ID等变化的部分
    return message
      .replace(/\d+/g, 'N') // 数字替换为N
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID') // UUID
      .replace(/\b\w+@\w+\.\w+\b/g, 'EMAIL') // 邮箱
      .replace(/https?:\/\/[^\s]+/g, 'URL') // URL
      .toLowerCase();
  }

  /**
   * 查找性能问题
   */
  private findPerformanceIssues(entries: LogEntry[]): Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedLogs: LogEntry[];
  }> {
    const issues: Array<{
      issue: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      affectedLogs: LogEntry[];
    }> = [];

    // 检查内存相关问题
    const memoryLogs = entries.filter(entry => 
      entry.category === 'memory' || 
      entry.message.toLowerCase().includes('memory') ||
      entry.message.toLowerCase().includes('内存')
    );

    if (memoryLogs.length > 10) {
      issues.push({
        issue: 'frequent_memory_logs',
        severity: 'medium',
        description: '内存相关日志频繁出现，可能存在内存管理问题',
        affectedLogs: memoryLogs.slice(-5),
      });
    }

    // 检查网络相关问题
    const networkErrorLogs = entries.filter(entry => 
      entry.level === 'ERROR' && 
      (entry.category === 'network' || 
       entry.message.toLowerCase().includes('network') ||
       entry.message.toLowerCase().includes('网络'))
    );

    if (networkErrorLogs.length > 5) {
      issues.push({
        issue: 'network_errors',
        severity: 'high',
        description: '网络错误频繁发生，影响应用功能',
        affectedLogs: networkErrorLogs.slice(-3),
      });
    }

    // 检查性能警告
    const performanceWarnings = entries.filter(entry => 
      entry.level === 'WARN' && 
      (entry.category === 'performance' ||
       entry.message.toLowerCase().includes('performance') ||
       entry.message.toLowerCase().includes('性能'))
    );

    if (performanceWarnings.length > 3) {
      issues.push({
        issue: 'performance_warnings',
        severity: 'medium',
        description: '性能警告较多，建议优化相关功能',
        affectedLogs: performanceWarnings.slice(-3),
      });
    }

    return issues;
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    errorPatterns: any[],
    performanceIssues: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (errorPatterns.length > 0) {
      recommendations.push('发现重复错误模式，建议针对性修复');
      
      const topPattern = errorPatterns[0];
      if (topPattern.count > 10) {
        recommendations.push(`最频繁的错误模式出现${topPattern.count}次，需要优先处理`);
      }
    }

    performanceIssues.forEach(issue => {
      switch (issue.issue) {
        case 'frequent_memory_logs':
          recommendations.push('建议检查内存使用情况，启用内存优化功能');
          break;
        case 'network_errors':
          recommendations.push('网络连接不稳定，建议检查网络配置和重试机制');
          break;
        case 'performance_warnings':
          recommendations.push('性能警告较多，建议启用性能监控和优化');
          break;
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('日志分析未发现明显问题，系统运行良好');
    }

    return recommendations;
  }

  /**
   * 生成日志报告
   */
  generateReport(): {
    timestamp: string;
    summary: {
      totalLogs: number;
      errorCount: number;
      warningCount: number;
      timeRange: string;
    };
    patterns: any;
    trends: any;
    recommendations: string[];
  } {
    const entries = this.logVisualization.getAllEntries();
    const stats = this.logVisualization.getLogStats();
    const patterns = this.analyzePatterns();
    const trends = this.logVisualization.getLogTrends();

    const errorCount = stats.byLevel.ERROR || 0;
    const warningCount = stats.byLevel.WARN || 0;
    
    const timeRange = stats.timeRange.earliest && stats.timeRange.latest
      ? `${new Date(stats.timeRange.earliest).toISOString()} - ${new Date(stats.timeRange.latest).toISOString()}`
      : '无数据';

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalLogs: stats.total,
        errorCount,
        warningCount,
        timeRange,
      },
      patterns,
      trends,
      recommendations: patterns.recommendations,
    };
  }
}

export default LogVisualization;
