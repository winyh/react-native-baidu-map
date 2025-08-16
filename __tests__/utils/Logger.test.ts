import { Logger, LogLevel } from '../../src/utils/Logger';

// Mock console methods
const mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation(() => {});
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Logger', () => {
  const originalPerformance = global.performance;

  beforeEach(() => {
    // 为测试环境提供 performance 对象
    if (!global.performance) {
      global.performance = {
        now: jest.fn(() => Date.now()),
      } as any;
    }
    
    jest.clearAllMocks();
    Logger.configure({ level: LogLevel.DEBUG });
  });

  afterEach(() => {
    // 恢复原始 performance 对象
    if (originalPerformance) {
      global.performance = originalPerformance;
    } else {
      delete (global as any).performance;
    }
  });

  afterAll(() => {
    mockConsoleDebug.mockRestore();
    mockConsoleInfo.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Log Levels', () => {
    it('should output debug logs', () => {
      Logger.debug('Debug message');
      expect(mockConsoleDebug).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
    });

    it('should output info logs', () => {
      Logger.info('Info message');
      expect(mockConsoleInfo).toHaveBeenCalledWith(expect.stringContaining('Info message'));
    });

    it('should output warn logs', () => {
      Logger.warn('Warn message');
      expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining('[BaiduMap] [WARN] Warn message'));
    });

    it('should output error logs', () => {
      Logger.error('Error message');
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('[BaiduMap] [ERROR] Error message'));
    });
  });

  describe('Configuration', () => {
    it('should configure log level', () => {
      Logger.configure({ level: LogLevel.ERROR });
      const config = Logger.getConfig();
      expect(config.level).toBe(LogLevel.ERROR);
    });

    it('should respect log level filtering', () => {
      Logger.configure({ level: LogLevel.ERROR });
      
      Logger.debug('Debug message');
      Logger.info('Info message');
      Logger.warn('Warn message');
      
      // None of these should be logged due to level filtering
      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      
      Logger.error('Error message');
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('[BaiduMap] [ERROR] Error message'));
    });
  });

  describe('Performance Monitoring', () => {
    it('should start and end performance timer', () => {
      const timerId = Logger.startPerformanceTimer('test-operation');
      expect(typeof timerId).toBe('string');
      
      const metrics = Logger.endPerformanceTimer(timerId, true);
      expect(metrics).toBeDefined();
      expect(metrics?.operation).toBe('test-operation');
      expect(typeof metrics?.duration).toBe('number');
    });

    it('should get performance metrics', () => {
      const timerId = Logger.startPerformanceTimer('test-operation');
      Logger.endPerformanceTimer(timerId, true);
      
      const metrics = Logger.getPerformanceMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('Log Management', () => {
    it('should get and clear logs', () => {
      Logger.debug('Test log message');
      
      const logs = Logger.getLogs();
      expect(Array.isArray(logs)).toBe(true);
      
      Logger.clearLogs();
      const clearedLogs = Logger.getLogs();
      expect(clearedLogs.length).toBe(0);
    });
  });
});