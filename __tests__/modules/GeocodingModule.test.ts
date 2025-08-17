import { NativeModules } from 'react-native';
import { GeocodingModule, LatLng, ErrorCode } from '../../src';

const { BaiduGeocodingModule: NativeGeocodingModule } = NativeModules;

describe('GeocodingModule', () => {
  describe('geocoding', () => {
    it('should return geocoding result', async () => {
      const address = '北京市海淀区上地十街10号';
      const city = '北京';
      const expected = { latitude: 0, longitude: 0, formattedAddress: 'mock address' };
      (NativeGeocodingModule.geocoding as jest.Mock).mockResolvedValue(expected);

      const result = await GeocodingModule.geocoding(address, city);
      expect(result).toEqual(expected);
      expect(NativeGeocodingModule.geocoding).toHaveBeenCalledWith(address, city);
    });

    it('should throw error if address is empty', async () => {
      await expect(GeocodingModule.geocoding('')).rejects.toMatchObject({
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    });

    it('should throw error if native module fails', async () => {
      const error = { code: '4004', message: 'some error' };
      (NativeGeocodingModule.geocoding as jest.Mock).mockRejectedValue(error);
      await expect(GeocodingModule.geocoding('address')).rejects.toEqual(error);
    });
  });

  describe('reverseGeocoding', () => {
    const coordinate: LatLng = { latitude: 39.915, longitude: 116.404 };

    it('should return reverse geocoding result', async () => {
      const expected = { formattedAddress: 'mock address' };
      (NativeGeocodingModule.reverseGeocoding as jest.Mock).mockResolvedValue(expected);

      const result = await GeocodingModule.reverseGeocoding(coordinate);
      expect(result).toEqual(expected);
      expect(NativeGeocodingModule.reverseGeocoding).toHaveBeenCalledWith(coordinate, 1000);
    });

    it('should throw error if coordinate is invalid', async () => {
      await expect(GeocodingModule.reverseGeocoding(null as any)).rejects.toMatchObject({
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    });

    it('should throw error if native module fails', async () => {
      const error = { code: '4004', message: 'some error' };
      (NativeGeocodingModule.reverseGeocoding as jest.Mock).mockRejectedValue(error);
      await expect(GeocodingModule.reverseGeocoding(coordinate)).rejects.toEqual(error);
    });
  });
});