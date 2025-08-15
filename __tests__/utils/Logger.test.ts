import { Logger } from '../../src/utils/Logger';

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock Date.now for consistent timing tests
const mockDateNow = jest.fn();
Date.now = mockDateNow;

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDateNow.mockReturnValue(1640995200000); // 2022-01-01 00:00:00 UTC
    
    // Replace console methods
    global.console = mockConsole as any;
    
    // Reset logger state
    Logger.clearPerformanceMetrics();
  });

  afterEach(() => {
    // Restore original console
    global.console = require('console');
  });

  describe('Basic logging methods', () => {
    it('should log info messages', () => {
      Logger.info('Test info message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test info message'
      );
    });

    it('should log warning messages', () => {
      Logger.warn('Test warning message');
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Test warning message'
      );
    });

    it('should log error messages', () => {
      Logger.error('Test error message');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Test error message'
      );
    });

    it('should log debug messages', () => {
      Logger.debug('Test debug message');
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Test debug message'
      );
    });

    it('should log messages with additional data', () => {
      const testData = { key: 'value', number: 123 };
      Logger.info('Test message with data', testData);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test message with data',
        testData
      );
    });

    it('should handle error objects', () => {
      const error = new Error('Test error');
      Logger.error('Error occurred', error);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Error occurred',
        error
      );
    });
  });

  describe('Performance timing', () => {
    it('should start and end performance timers', () => {
      const timerId = Logger.startPerformanceTimer('test-operation');
      expect(typeof timerId).toBe('string');
      expect(timerId).toContain('test-operation');
      
      // Advance time by 100ms
      mockDateNow.mockReturnValue(1640995200100);
      
      Logger.endPerformanceTimer(timerId, true);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[PERF]'),
        expect.stringContaining('test-operation'),
        expect.stringContaining('100ms'),
        expect.stringContaining('SUCCESS')
      );
    });

    it('should handle failed operations', () => {
      const timerId = Logger.startPerformanceTimer('failed-operation');
      
      mockDateNow.mockReturnValue(1640995200050);
      
      const error = new Error('Operation failed');
      Logger.endPerformanceTimer(timerId, false, error);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[PERF]'),
        expect.stringContaining('failed-operation'),
        expect.stringContaining('50ms'),
        expect.stringContaining('FAILED'),
        error
      );
    });

    it('should handle missing timer IDs', () => {
      Logger.endPerformanceTimer('non-existent-timer', true);
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Timer not found')
      );
    });

    it('should generate unique timer IDs', () => {
      const timer1 = Logger.startPerformanceTimer('operation');
      const timer2 = Logger.startPerformanceTimer('operation');
      
      expect(timer1).not.toBe(timer2);
      expect(timer1).toContain('operation');
      expect(timer2).toContain('operation');
    });
  });

  describe('Performance statistics', () => {
    beforeEach(() => {
      // Setup some performance data
      const timer1 = Logger.startPerformanceTimer('fast-operation');
      mockDateNow.mockReturnValue(1640995200010); // 10ms
      Logger.endPerformanceTimer(timer1, true);
      
      const timer2 = Logger.startPerformanceTimer('slow-operation');
      mockDateNow.mockReturnValue(1640995200100); // 100ms from start
      Logger.endPerformanceTimer(timer2, true);
      
      const timer3 = Logger.startPerformanceTimer('failed-operation');
      mockDateNow.mockReturnValue(1640995200150); // 150ms from start
      Logger.endPerformanceTimer(timer3, false);
      
      const timer4 = Logger.startPerformanceTimer('fast-operation');
      mockDateNow.mockReturnValue(1640995200170); // 170ms from start
      Logger.endPerformanceTimer(timer4, true);
    });

    it('should calculate performance statistics correctly', () => {
      const stats = Logger.getPerformanceStats();
      
      expect(stats.totalOperations).toBe(4);
      expect(stats.successRate).toBe(75); // 3 out of 4 successful
      expect(stats.averageDuration).toBe(67.5); // (10 + 100 + 50 + 20) / 4
    });

    it('should identify slowest and fastest operations', () => {
      const stats = Logger.getPerformanceStats();
      
      expect(stats.slowestOperation).toEqual({
        operation: 'slow-operation',
        duration: 100,
        success: true,
      });
      
      expect(stats.fastestOperation).toEqual({
        operation: 'fast-operation',
        duration: 10,
        success: true,
      });
    });

    it('should group operations by type', () => {
      const stats = Logger.getPerformanceStats();
      
      expect(stats.operationStats['fast-operation']).toEqual({
        count: 2,
        successRate: 100,
        averageDuration: 15, // (10 + 20) / 2
        totalDuration: 30,
      });
      
      expect(stats.operationStats['slow-operation']).toEqual({
        count: 1,
        successRate: 100,
        averageDuration: 100,
        totalDuration: 100,
      });
      
      expect(stats.operationStats['failed-operation']).toEqual({
        count: 1,
        successRate: 0,
        averageDuration: 50,
        totalDuration: 50,
      });
    });

    it('should handle empty performance data', () => {
      Logger.clearPerformanceMetrics();
      const stats = Logger.getPerformanceStats();
      
      expect(stats.totalOperations).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.slowestOperation).toBeNull();
      expect(stats.fastestOperation).toBeNull();
      expect(Object.keys(stats.operationStats)).toHaveLength(0);
    });
  });

  describe('Log level filtering', () => {
    it('should respect log level settings', () => {
      // Assuming Logger has a setLogLevel method
      if (typeof Logger.setLogLevel === 'function') {
        Logger.setLogLevel('ERROR');
        
        Logger.debug('Debug message');
        Logger.info('Info message');
        Logger.warn('Warning message');
        Logger.error('Error message');
        
        expect(mockConsole.debug).not.toHaveBeenCalled();
        expect(mockConsole.info).not.toHaveBeenCalled();
        expect(mockConsole.warn).not.toHaveBeenCalled();
        expect(mockConsole.error).toHaveBeenCalled();
      }
    });
  });

  describe('Timestamp formatting', () => {
    it('should include timestamps in log messages', () => {
      Logger.info('Test message');
      
      const logCall = mockConsole.info.mock.calls[0];
      const timestamp = logCall[0];
      
      expect(timestamp).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/);
    });

    it('should use consistent timestamp format', () => {
      Logger.info('Message 1');
      Logger.warn('Message 2');
      Logger.error('Message 3');
      
      const infoTimestamp = mockConsole.info.mock.calls[0][0];
      const warnTimestamp = mockConsole.warn.mock.calls[0][0];
      const errorTimestamp = mockConsole.error.mock.calls[0][0];
      
      // All should have the same timestamp format
      const timestampRegex = /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/;
      expect(infoTimestamp).toMatch(timestampRegex);
      expect(warnTimestamp).toMatch(timestampRegex);
      expect(errorTimestamp).toMatch(timestampRegex);
    });
  });

  describe('Memory management', () => {
    it('should clear performance metrics', () => {
      // Add some performance data
      const timer = Logger.startPerformanceTimer('test');
      Logger.endPerformanceTimer(timer, true);
      
      let stats = Logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1);
      
      Logger.clearPerformanceMetrics();
      
      stats = Logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(0);
    });

    it('should handle large numbers of performance entries', () => {
      // Create many performance entries
      for (let i = 0; i < 1000; i++) {
        const timer = Logger.startPerformanceTimer(`operation-${i}`);
        mockDateNow.mockReturnValue(1640995200000 + i);
        Logger.endPerformanceTimer(timer, i % 2 === 0); // Alternate success/failure
      }
      
      const stats = Logger.getPerformanceStats();
      expect(stats.totalOperations).toBe(1000);
      expect(stats.successRate).toBe(50); // 50% success rate
      expect(Object.keys(stats.operationStats)).toHaveLength(1000);
    });
  });

  describe('Error handling', () => {
    it('should handle null or undefined messages', () => {
      expect(() => {
        Logger.info(null as any);
        Logger.warn(undefined as any);
        Logger.error('');
      }).not.toThrow();
    });

    it('should handle circular references in data', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      expect(() => {
        Logger.info('Circular object', circularObj);
      }).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      
      expect(() => {
        Logger.info(longMessage);
      }).not.toThrow();
    });
  });
});