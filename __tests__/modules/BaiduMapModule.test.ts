import { BaiduMapModule } from '../../src/modules/BaiduMapModule';
import { LocationMode, CoordinateType, LogLevel } from '../../src/types';

// Mock React Native NativeModules
jest.mock('react-native', () => ({
  NativeModules: {
    BaiduMapModule: {
      setAgreePrivacy: jest.fn(),
      initialize: jest.fn(),
      getVersion: jest.fn(),
      isInitialized: jest.fn(),
      setLogLevel: jest.fn(),
      clearCache: jest.fn(),
      setUserAgent: jest.fn(),
    },
  },
}));

const mockNativeModule = require('react-native').NativeModules.BaiduMapModule;

describe('BaiduMapModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAgreePrivacy', () => {
    it('should call native setAgreePrivacy with correct parameter', async () => {
      mockNativeModule.setAgreePrivacy.mockResolvedValue(undefined);

      await BaiduMapModule.setAgreePrivacy(true);

      expect(mockNativeModule.setAgreePrivacy).toHaveBeenCalledWith(true);
    });

    it('should handle false parameter', async () => {
      mockNativeModule.setAgreePrivacy.mockResolvedValue(undefined);

      await BaiduMapModule.setAgreePrivacy(false);

      expect(mockNativeModule.setAgreePrivacy).toHaveBeenCalledWith(false);
    });

    it('should handle native module errors', async () => {
      const error = new Error('Native module error');
      mockNativeModule.setAgreePrivacy.mockRejectedValue(error);

      await expect(BaiduMapModule.setAgreePrivacy(true)).rejects.toThrow('Native module error');
    });
  });

  describe('initialize', () => {
    const validConfig = {
      apiKey: 'test-api-key',
      enableLocation: true,
      locationMode: LocationMode.HIGH_ACCURACY,
      coordinateType: CoordinateType.BD09LL,
      enableHttps: true,
      enableDebug: false,
    };

    it('should initialize with valid config', async () => {
      const expectedResult = { success: true };
      mockNativeModule.initialize.mockResolvedValue(expectedResult);

      const result = await BaiduMapModule.initialize(validConfig);

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(validConfig);
      expect(result).toEqual(expectedResult);
    });

    it('should handle initialization failure', async () => {
      const expectedResult = {
        success: false,
        error: {
          code: 101,
          message: 'Invalid API key',
        },
      };
      mockNativeModule.initialize.mockResolvedValue(expectedResult);

      const result = await BaiduMapModule.initialize(validConfig);

      expect(result).toEqual(expectedResult);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(101);
    });

    it('should handle minimal config', async () => {
      const minimalConfig = {
        apiKey: 'test-api-key',
      };
      const expectedResult = { success: true };
      mockNativeModule.initialize.mockResolvedValue(expectedResult);

      const result = await BaiduMapModule.initialize(minimalConfig);

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(minimalConfig);
      expect(result).toEqual(expectedResult);
    });

    it('should handle native module errors during initialization', async () => {
      const error = new Error('Initialization failed');
      mockNativeModule.initialize.mockRejectedValue(error);

      await expect(BaiduMapModule.initialize(validConfig)).rejects.toThrow('Initialization failed');
    });
  });

  describe('getVersion', () => {
    it('should return SDK version', async () => {
      const expectedVersion = '7.6.5';
      mockNativeModule.getVersion.mockResolvedValue(expectedVersion);

      const version = await BaiduMapModule.getVersion();

      expect(mockNativeModule.getVersion).toHaveBeenCalled();
      expect(version).toBe(expectedVersion);
    });

    it('should handle version retrieval errors', async () => {
      const error = new Error('Failed to get version');
      mockNativeModule.getVersion.mockRejectedValue(error);

      await expect(BaiduMapModule.getVersion()).rejects.toThrow('Failed to get version');
    });
  });

  describe('isInitialized', () => {
    it('should return true when initialized', async () => {
      mockNativeModule.isInitialized.mockResolvedValue(true);

      const result = await BaiduMapModule.isInitialized();

      expect(mockNativeModule.isInitialized).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when not initialized', async () => {
      mockNativeModule.isInitialized.mockResolvedValue(false);

      const result = await BaiduMapModule.isInitialized();

      expect(result).toBe(false);
    });

    it('should handle errors when checking initialization status', async () => {
      const error = new Error('Failed to check initialization');
      mockNativeModule.isInitialized.mockRejectedValue(error);

      await expect(BaiduMapModule.isInitialized()).rejects.toThrow('Failed to check initialization');
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