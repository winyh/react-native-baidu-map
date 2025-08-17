import { NativeModules } from 'react-native';
import { RoutePlanningModule, LatLng, ErrorCode } from '../../src';

const { BaiduRoutePlanningModule: NativeRoutePlanningModule } = NativeModules;

describe('RoutePlanningModule', () => {
  describe('plan', () => {
    const start: LatLng = { latitude: 39.915, longitude: 116.404 };
    const end: LatLng = { latitude: 39.955, longitude: 116.434 };

    it('should return route planning result', async () => {
      const expected = { routes: [{ points: [start, end] }] };
      (NativeRoutePlanningModule.plan as jest.Mock).mockResolvedValue(expected);

      const result = await RoutePlanningModule.plan({ start, end, mode: 'driving' });
      expect(result).toEqual(expected);
      expect(NativeRoutePlanningModule.plan).toHaveBeenCalledWith({ start, end, mode: 'driving' });
    });

    it('should throw error if start is invalid', async () => {
      await expect(RoutePlanningModule.plan({ start: null as any, end, mode: 'driving' })).rejects.toMatchObject({
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    });

    it('should throw error if end is invalid', async () => {
      await expect(RoutePlanningModule.plan({ start, end: null as any, mode: 'driving' })).rejects.toMatchObject({
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    });

    it('should throw error if native module fails', async () => {
      const error = { code: '5003', message: 'some error' };
      (NativeRoutePlanningModule.plan as jest.Mock).mockRejectedValue(error);
      await expect(RoutePlanningModule.plan({ start, end, mode: 'driving' })).rejects.toEqual(error);
    });
  });
});