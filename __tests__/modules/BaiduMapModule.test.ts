import { BaiduMapModule } from '../../src/modules/BaiduMapModule';
import { NativeModules } from 'react-native';
import { LogLevel } from '../../src/types';

declare global {
  var performance: any;
}

// Mock NativeModules
const mockBaiduMapModule = {
  initialize: jest.fn(),
  isSDKInitialized: jest.fn(),
  getSDKVersion: jest.fn(),
  clearMapCache: jest.fn(),
  setAgreePrivacy: jest.fn(),
  convertCoordinate: jest.fn(),
  convertCoordinates: jest.fn(),
  takeSnapshot: jest.fn(),
  setMapCustomStyle: jest.fn(),
  setLogLevel: jest.fn(),
  clearCache: jest.fn(),
  setUserAgent: jest.fn(),
  isInitialized: jest.fn(),
  getVersion: jest.fn(),
};

jest.mock('react-native', () => ({
  NativeModules: {
    BaiduMapModule: mockBaiduMapModule,
  },
}));

const mockNativeModule = NativeModules.BaiduMapModule;

const validConfig = {
  apiKey: 'test-api-key',
  logEnable: true,
  logLevel: 'DEBUG',
  autoStartLocating: false,
};

describe('BaiduMapModule', () => {
  const originalPerformance = global.performance;

  beforeEach(() => {
    // 为测试环境提供 performance 对象
    if (!global.performance) {
      global.performance = {
        now: jest.fn(() => Date.now()),
      } as any;
    }

    jest.clearAllMocks();
  });

  afterEach(() => {
    // 恢复原始 performance 对象
    if (originalPerformance) {
      global.performance = originalPerformance;
    } else {
      delete (global as any).performance;
    }
  });

  describe('setAgreePrivacy', () => {
    it('should call native setAgreePrivacy with correct parameter', async () => {
      mockNativeModule.setAgreePrivacy.mockResolvedValue({ success: true });
      
      const result = await BaiduMapModule.setAgreePrivacy(true);
      
      expect(mockNativeModule.setAgreePrivacy).toHaveBeenCalledWith(true);
      expect(result.success).toBe(true);
    });

    it('should handle false parameter', async () => {
      mockNativeModule.setAgreePrivacy.mockResolvedValue({ success: true });
      
      const result = await BaiduMapModule.setAgreePrivacy(false);
      
      expect(mockNativeModule.setAgreePrivacy).toHaveBeenCalledWith(false);
      expect(result.success).toBe(true);
    });

    it('should handle native module errors', async () => {
      const error = new Error('Native module error');
      mockNativeModule.setAgreePrivacy.mockRejectedValue(error);
      
      await expect(BaiduMapModule.setAgreePrivacy(true)).rejects.toThrow('Native module error');
    });
  });

  describe('initialize', () => {
    it('should call native initialize method', async () => {
      const mockResult = { success: true, version: '1.0.0' };
      mockNativeModule.initialize.mockResolvedValue(mockResult);
      
      const config = { apiKey: 'test-key' };
      const result = await BaiduMapModule.initialize(config);
      
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(config);
      expect(result).toEqual(mockResult);
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      mockNativeModule.initialize.mockRejectedValue(error);
      
      const config = { apiKey: 'test-key' };
      await expect(BaiduMapModule.initialize(config)).rejects.toThrow('Initialization failed');
    });
  });

  describe('getSDKVersion', () => {
    it('should return version info', async () => {
      const mockVersion = { 
        success: true, 
        data: { 
          sdkVersion: '1.0.0', 
          apiVersion: '2.0.0' 
        } 
      };
      mockNativeModule.getSDKVersion.mockResolvedValue(mockVersion);
      
      const result = await BaiduMapModule.getSDKVersion();
      
      expect(mockNativeModule.getSDKVersion).toHaveBeenCalled();
      expect(result).toEqual(mockVersion);
    });
  });

  describe('isInitialized', () => {
    it('should check initialization status', async () => {
      mockNativeModule.isSDKInitialized.mockResolvedValue({ success: true, data: true });
      
      const result = await BaiduMapModule.isSDKInitialized();
      
      expect(mockNativeModule.isSDKInitialized).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('clearMapCache', () => {
    it('should clear cache', async () => {
      mockNativeModule.clearMapCache.mockResolvedValue({ success: true });
      
      const result = await BaiduMapModule.clearMapCache();
      
      expect(mockNativeModule.clearMapCache).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('setLogLevel', () => {
    it('should set log level to DEBUG', async () => {
      mockNativeModule.setLogLevel.mockResolvedValue(undefined);

      await BaiduMapModule.setLogLevel(LogLevel.DEBUG);

      expect(mockNativeModule.setLogLevel).toHaveBeenCalledWith(LogLevel.DEBUG);
    });

    it('should set log level to ERROR', async () => {
      mockNativeModule.setLogLevel.mockResolvedValue(undefined);

      await BaiduMapModule.setLogLevel(LogLevel.ERROR);

      expect(mockNativeModule.setLogLevel).toHaveBeenCalledWith(LogLevel.ERROR);
    });

    it('should set log level to NONE', async () => {
      mockNativeModule.setLogLevel.mockResolvedValue(undefined);

      await BaiduMapModule.setLogLevel(LogLevel.NONE);

      expect(mockNativeModule.setLogLevel).toHaveBeenCalledWith(LogLevel.NONE);
    });

    it('should handle log level setting errors', async () => {
      const error = new Error('Failed to set log level');
      mockNativeModule.setLogLevel.mockRejectedValue(error);

      await expect(BaiduMapModule.setLogLevel(LogLevel.DEBUG)).rejects.toThrow('Failed to set log level');
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', async () => {
      mockNativeModule.clearCache.mockResolvedValue(undefined);

      await BaiduMapModule.clearCache();

      expect(mockNativeModule.clearCache).toHaveBeenCalled();
    });

    it('should handle cache clearing errors', async () => {
      const error = new Error('Failed to clear cache');
      mockNativeModule.clearCache.mockRejectedValue(error);

      await expect(BaiduMapModule.clearCache()).rejects.toThrow('Failed to clear cache');
    });
  });

  describe('setUserAgent', () => {
    it('should set user agent successfully', async () => {
      const userAgent = 'MyApp/1.0.0';
      mockNativeModule.setUserAgent.mockResolvedValue(undefined);

      await BaiduMapModule.setUserAgent(userAgent);

      expect(mockNativeModule.setUserAgent).toHaveBeenCalledWith(userAgent);
    });

    it('should handle empty user agent', async () => {
      const userAgent = '';
      mockNativeModule.setUserAgent.mockResolvedValue(undefined);

      await BaiduMapModule.setUserAgent(userAgent);

      expect(mockNativeModule.setUserAgent).toHaveBeenCalledWith(userAgent);
    });

    it('should handle user agent setting errors', async () => {
      const error = new Error('Failed to set user agent');
      mockNativeModule.setUserAgent.mockRejectedValue(error);

      await expect(BaiduMapModule.setUserAgent('MyApp/1.0.0')).rejects.toThrow('Failed to set user agent');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete initialization flow', async () => {
      // Mock successful responses
      mockNativeModule.setAgreePrivacy.mockResolvedValue(undefined);
      mockNativeModule.isInitialized.mockResolvedValue(false);
      mockNativeModule.initialize.mockResolvedValue({ success: true });
      mockNativeModule.getVersion.mockResolvedValue('7.6.5');

      // Execute initialization flow
      await BaiduMapModule.setAgreePrivacy(true);
      const isInitialized = await BaiduMapModule.isInitialized();
      expect(isInitialized).toBe(false);

      const result = await BaiduMapModule.initialize(validConfig);
      expect(result.success).toBe(true);

      const version = await BaiduMapModule.getVersion();
      expect(version).toBe('7.6.5');

      // Verify call order and parameters
      expect(mockNativeModule.setAgreePrivacy).toHaveBeenCalledWith(true);
      expect(mockNativeModule.isInitialized).toHaveBeenCalled();
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(validConfig);
      expect(mockNativeModule.getVersion).toHaveBeenCalled();
    });

    it('should handle initialization failure flow', async () => {
      mockNativeModule.setAgreePrivacy.mockResolvedValue(undefined);
      mockNativeModule.initialize.mockResolvedValue({
        success: false,
        error: { code: 101, message: 'Invalid API key' },
      });

      await BaiduMapModule.setAgreePrivacy(true);
      const result = await BaiduMapModule.initialize(validConfig);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(101);
      expect(result.error?.message).toBe('Invalid API key');
    });

    it('should handle already initialized scenario', async () => {
      mockNativeModule.isInitialized.mockResolvedValue(true);
      mockNativeModule.getVersion.mockResolvedValue('7.6.5');

      const isInitialized = await BaiduMapModule.isInitialized();
      expect(isInitialized).toBe(true);

      const version = await BaiduMapModule.getVersion();
      expect(version).toBe('7.6.5');

      // Should not call initialize if already initialized
      expect(mockNativeModule.initialize).not.toHaveBeenCalled();
    });
  });
});
