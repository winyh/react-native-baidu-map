import { CoordinateConverter } from '../../src/utils/CoordinateConverter';
import { CoordinateType, LatLng } from '../../src/types';

// Mock React Native NativeModules
jest.mock('react-native', () => ({
  NativeModules: {
    CoordinateConverter: {
      convertCoordinate: jest.fn(),
      convertBatch: jest.fn(),
      isValidCoordinate: jest.fn(),
      getCoordinateType: jest.fn(),
    },
  },
}));

const mockNativeModule = require('react-native').NativeModules.CoordinateConverter;

describe('CoordinateConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertCoordinate', () => {
    const testCoordinate: LatLng = { latitude: 39.915, longitude: 116.404 };

    it('should convert BD09 to GCJ02', async () => {
      const expectedResult = {
        success: true,
        latitude: 39.914,
        longitude: 116.403,
      };
      mockNativeModule.convertCoordinate.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertCoordinate(
        testCoordinate,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(mockNativeModule.convertCoordinate).toHaveBeenCalledWith(
        testCoordinate,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );
      expect(result).toEqual(expectedResult);
    });

    it('should convert GCJ02 to WGS84', async () => {
      const expectedResult = {
        success: true,
        latitude: 39.913,
        longitude: 116.402,
      };
      mockNativeModule.convertCoordinate.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertCoordinate(
        testCoordinate,
        CoordinateType.GCJ02,
        CoordinateType.WGS84
      );

      expect(result).toEqual(expectedResult);
    });

    it('should convert WGS84 to BD09', async () => {
      const expectedResult = {
        success: true,
        latitude: 39.916,
        longitude: 116.405,
      };
      mockNativeModule.convertCoordinate.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertCoordinate(
        testCoordinate,
        CoordinateType.WGS84,
        CoordinateType.BD09LL
      );

      expect(result).toEqual(expectedResult);
    });

    it('should handle same coordinate type conversion', async () => {
      const expectedResult = {
        success: true,
        latitude: testCoordinate.latitude,
        longitude: testCoordinate.longitude,
      };
      mockNativeModule.convertCoordinate.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertCoordinate(
        testCoordinate,
        CoordinateType.BD09LL,
        CoordinateType.BD09LL
      );

      expect(result).toEqual(expectedResult);
    });

    it('should handle conversion failure', async () => {
      const expectedResult = {
        success: false,
        error: 'Invalid coordinate',
      };
      mockNativeModule.convertCoordinate.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertCoordinate(
        testCoordinate,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid coordinate');
    });

    it('should handle invalid coordinates', async () => {
      const invalidCoordinate = { latitude: 200, longitude: 200 };
      const expectedResult = {
        success: false,
        error: 'Coordinate out of range',
      };
      mockNativeModule.convertCoordinate.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertCoordinate(
        invalidCoordinate,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(result.success).toBe(false);
    });

    it('should handle native module errors', async () => {
      const error = new Error('Native conversion failed');
      mockNativeModule.convertCoordinate.mockRejectedValue(error);

      await expect(
        CoordinateConverter.convertCoordinate(
          testCoordinate,
          CoordinateType.BD09LL,
          CoordinateType.GCJ02
        )
      ).rejects.toThrow('Native conversion failed');
    });
  });

  describe('convertBatch', () => {
    const testCoordinates: LatLng[] = [
      { latitude: 39.915, longitude: 116.404 },
      { latitude: 39.925, longitude: 116.414 },
      { latitude: 39.935, longitude: 116.424 },
    ];

    it('should convert multiple coordinates successfully', async () => {
      const expectedResult = {
        success: true,
        coordinates: [
          { latitude: 39.914, longitude: 116.403 },
          { latitude: 39.924, longitude: 116.413 },
          { latitude: 39.934, longitude: 116.423 },
        ],
      };
      mockNativeModule.convertBatch.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertBatch(
        testCoordinates,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(mockNativeModule.convertBatch).toHaveBeenCalledWith(
        testCoordinates,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );
      expect(result).toEqual(expectedResult);
      expect(result.coordinates).toHaveLength(3);
    });

    it('should handle empty coordinate array', async () => {
      const expectedResult = {
        success: true,
        coordinates: [],
      };
      mockNativeModule.convertBatch.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertBatch(
        [],
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(result.coordinates).toHaveLength(0);
    });

    it('should handle batch conversion failure', async () => {
      const expectedResult = {
        success: false,
        error: 'Batch conversion failed',
      };
      mockNativeModule.convertBatch.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertBatch(
        testCoordinates,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Batch conversion failed');
    });

    it('should handle partial conversion success', async () => {
      const expectedResult = {
        success: true,
        coordinates: [
          { latitude: 39.914, longitude: 116.403 },
          null, // Failed conversion
          { latitude: 39.934, longitude: 116.423 },
        ],
        errors: [null, 'Invalid coordinate', null],
      };
      mockNativeModule.convertBatch.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertBatch(
        testCoordinates,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(result.coordinates).toHaveLength(3);
      expect(result.coordinates[1]).toBeNull();
      expect(result.errors?.[1]).toBe('Invalid coordinate');
    });
  });

  describe('isValidCoordinate', () => {
    it('should validate correct coordinates', async () => {
      const validCoordinate = { latitude: 39.915, longitude: 116.404 };
      mockNativeModule.isValidCoordinate.mockResolvedValue(true);

      const result = await CoordinateConverter.isValidCoordinate(validCoordinate);

      expect(mockNativeModule.isValidCoordinate).toHaveBeenCalledWith(validCoordinate);
      expect(result).toBe(true);
    });

    it('should invalidate out-of-range coordinates', async () => {
      const invalidCoordinate = { latitude: 200, longitude: 200 };
      mockNativeModule.isValidCoordinate.mockResolvedValue(false);

      const result = await CoordinateConverter.isValidCoordinate(invalidCoordinate);

      expect(result).toBe(false);
    });

    it('should validate boundary coordinates', async () => {
      const boundaryCoordinates = [
        { latitude: 90, longitude: 180 },
        { latitude: -90, longitude: -180 },
        { latitude: 0, longitude: 0 },
      ];

      for (const coord of boundaryCoordinates) {
        mockNativeModule.isValidCoordinate.mockResolvedValue(true);
        const result = await CoordinateConverter.isValidCoordinate(coord);
        expect(result).toBe(true);
      }
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation failed');
      mockNativeModule.isValidCoordinate.mockRejectedValue(error);

      await expect(
        CoordinateConverter.isValidCoordinate({ latitude: 39.915, longitude: 116.404 })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('getCoordinateType', () => {
    it('should detect BD09 coordinates', async () => {
      const coordinate = { latitude: 39.915, longitude: 116.404 };
      mockNativeModule.getCoordinateType.mockResolvedValue(CoordinateType.BD09LL);

      const result = await CoordinateConverter.getCoordinateType(coordinate);

      expect(mockNativeModule.getCoordinateType).toHaveBeenCalledWith(coordinate);
      expect(result).toBe(CoordinateType.BD09LL);
    });

    it('should detect GCJ02 coordinates', async () => {
      const coordinate = { latitude: 39.914, longitude: 116.403 };
      mockNativeModule.getCoordinateType.mockResolvedValue(CoordinateType.GCJ02);

      const result = await CoordinateConverter.getCoordinateType(coordinate);

      expect(result).toBe(CoordinateType.GCJ02);
    });

    it('should detect WGS84 coordinates', async () => {
      const coordinate = { latitude: 39.913, longitude: 116.402 };
      mockNativeModule.getCoordinateType.mockResolvedValue(CoordinateType.WGS84);

      const result = await CoordinateConverter.getCoordinateType(coordinate);

      expect(result).toBe(CoordinateType.WGS84);
    });

    it('should handle unknown coordinate type', async () => {
      const coordinate = { latitude: 0, longitude: 0 };
      mockNativeModule.getCoordinateType.mockResolvedValue(null);

      const result = await CoordinateConverter.getCoordinateType(coordinate);

      expect(result).toBeNull();
    });

    it('should handle coordinate type detection errors', async () => {
      const error = new Error('Type detection failed');
      mockNativeModule.getCoordinateType.mockRejectedValue(error);

      await expect(
        CoordinateConverter.getCoordinateType({ latitude: 39.915, longitude: 116.404 })
      ).rejects.toThrow('Type detection failed');
    });
  });

  describe('Coordinate precision', () => {
    it('should maintain precision during conversion', async () => {
      const preciseCoordinate = { latitude: 39.915123456, longitude: 116.404987654 };
      const expectedResult = {
        success: true,
        latitude: 39.914123456,
        longitude: 116.403987654,
      };
      mockNativeModule.convertCoordinate.mockResolvedValue(expectedResult);

      const result = await CoordinateConverter.convertCoordinate(
        preciseCoordinate,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(result.latitude).toBe(39.914123456);
      expect(result.longitude).toBe(116.403987654);
    });

    it('should handle very small coordinate differences', async () => {
      const coordinate1 = { latitude: 39.915000001, longitude: 116.404000001 };
      const coordinate2 = { latitude: 39.915000002, longitude: 116.404000002 };

      mockNativeModule.convertCoordinate
        .mockResolvedValueOnce({
          success: true,
          latitude: 39.914000001,
          longitude: 116.403000001,
        })
        .mockResolvedValueOnce({
          success: true,
          latitude: 39.914000002,
          longitude: 116.403000002,
        });

      const result1 = await CoordinateConverter.convertCoordinate(
        coordinate1,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );
      const result2 = await CoordinateConverter.convertCoordinate(
        coordinate2,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );

      expect(result1.latitude).not.toBe(result2.latitude);
      expect(result1.longitude).not.toBe(result2.longitude);
    });
  });
});