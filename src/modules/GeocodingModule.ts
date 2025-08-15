import { NativeModules } from 'react-native';
import {
  LatLng,
  MapMethodResult,
  BaiduMapErrorCode,
} from '../types';

const { BaiduGeocodingModule: NativeGeocodingModule } = NativeModules;

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  adCode?: string;
  cityCode?: string;
}

export interface ReverseGeocodingResult {
  formattedAddress: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  adCode?: string;
  cityCode?: string;
  business?: string;
  sematicDescription?: string;
}

export interface POIInfo {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  uid?: string;
  phone?: string;
  postcode?: string;
  type?: string;
  tag?: string;
  detail?: number;
  price?: number;
  shopHours?: string;
  overallRating?: number;
  tasteRating?: number;
  serviceRating?: number;
  environmentRating?: number;
  facilityRating?: number;
  hygieneRating?: number;
  technologyRating?: number;
  imageNumber?: number;
  grouponNumber?: number;
  discountNumber?: number;
  commentNumber?: number;
  favoriteNumber?: number;
  checkInNumber?: number;
}

export interface POISearchOptions {
  keyword: string;
  city?: string;
  region?: {
    center: LatLng;
    radius: number;
  };
  pageIndex?: number;
  pageSize?: number;
  scope?: number; // 检索结果详细程度，0-基本信息，1-详细信息
}

export interface POISearchResult {
  totalPageNumber: number;
  totalResultNumber: number;
  currentPageNumber: number;
  pageSize: number;
  poiInfoList: POIInfo[];
}

export interface NearbySearchOptions {
  location: LatLng;
  radius: number;
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
  sortType?: 'distance' | 'comprehensive';
}

export interface SuggestionSearchOptions {
  keyword: string;
  city?: string;
  cityLimit?: boolean;
}

export interface SuggestionInfo {
  key: string;
  city: string;
  district: string;
  pt?: LatLng;
  uid?: string;
}

export class GeocodingModule {
  /**
   * 地理编码 - 将地址转换为坐标
   */
  static async geocoding(address: string, city?: string): Promise<MapMethodResult<GeocodingResult>> {
    if (!NativeGeocodingModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '地理编码模块未找到',
        },
      };
    }

    if (!address || address.trim().length === 0) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '地址不能为空',
        },
      };
    }

    try {
      const result = await NativeGeocodingModule.geocoding(address, city);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '地理编码失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 逆地理编码 - 将坐标转换为地址
   */
  static async reverseGeocoding(
    coordinate: LatLng,
    radius?: number
  ): Promise<MapMethodResult<ReverseGeocodingResult>> {
    if (!NativeGeocodingModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '地理编码模块未找到',
        },
      };
    }

    if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '坐标参数无效',
        },
      };
    }

    try {
      const result = await NativeGeocodingModule.reverseGeocoding(coordinate, radius || 1000);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '逆地理编码失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * POI搜索
   */
  static async searchPOI(options: POISearchOptions): Promise<MapMethodResult<POISearchResult>> {
    if (!NativeGeocodingModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '地理编码模块未找到',
        },
      };
    }

    if (!options.keyword || options.keyword.trim().length === 0) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '搜索关键词不能为空',
        },
      };
    }

    try {
      const searchOptions = {
        ...options,
        pageIndex: options.pageIndex || 0,
        pageSize: options.pageSize || 10,
        scope: options.scope || 1,
      };

      const result = await NativeGeocodingModule.searchPOI(searchOptions);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : 'POI搜索失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 周边搜索
   */
  static async searchNearby(options: NearbySearchOptions): Promise<MapMethodResult<POISearchResult>> {
    if (!NativeGeocodingModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '地理编码模块未找到',
        },
      };
    }

    if (!options.location || typeof options.location.latitude !== 'number' || typeof options.location.longitude !== 'number') {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '搜索位置参数无效',
        },
      };
    }

    if (!options.radius || options.radius <= 0) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '搜索半径必须大于0',
        },
      };
    }

    try {
      const searchOptions = {
        ...options,
        pageIndex: options.pageIndex || 0,
        pageSize: options.pageSize || 10,
        sortType: options.sortType || 'distance',
      };

      const result = await NativeGeocodingModule.searchNearby(searchOptions);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '周边搜索失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 搜索建议
   */
  static async searchSuggestion(options: SuggestionSearchOptions): Promise<MapMethodResult<SuggestionInfo[]>> {
    if (!NativeGeocodingModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '地理编码模块未找到',
        },
      };
    }

    if (!options.keyword || options.keyword.trim().length === 0) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '搜索关键词不能为空',
        },
      };
    }

    try {
      const searchOptions = {
        ...options,
        cityLimit: options.cityLimit !== false, // 默认限制城市
      };

      const result = await NativeGeocodingModule.searchSuggestion(searchOptions);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '搜索建议失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 批量地理编码
   */
  static async batchGeocoding(addresses: string[], city?: string): Promise<MapMethodResult<GeocodingResult[]>> {
    if (!addresses || addresses.length === 0) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '地址列表不能为空',
        },
      };
    }

    try {
      const results: GeocodingResult[] = [];
      const errors: string[] = [];

      // 逐个进行地理编码
      for (const address of addresses) {
        const result = await this.geocoding(address, city);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`${address}: ${result.error?.message || '编码失败'}`);
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          error: {
            code: BaiduMapErrorCode.UNKNOWN_ERROR,
            message: `所有地址编码失败: ${errors.join(', ')}`,
          },
        };
      }

      return {
        success: true,
        data: results,
        message: errors.length > 0 ? `部分地址编码失败: ${errors.join(', ')}` : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '批量地理编码失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 批量逆地理编码
   */
  static async batchReverseGeocoding(
    coordinates: LatLng[],
    radius?: number
  ): Promise<MapMethodResult<ReverseGeocodingResult[]>> {
    if (!coordinates || coordinates.length === 0) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '坐标列表不能为空',
        },
      };
    }

    try {
      const results: ReverseGeocodingResult[] = [];
      const errors: string[] = [];

      // 逐个进行逆地理编码
      for (const coordinate of coordinates) {
        const result = await this.reverseGeocoding(coordinate, radius);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`${coordinate.latitude},${coordinate.longitude}: ${result.error?.message || '编码失败'}`);
        }
      }

      if (results.length === 0) {
        return {
          success: false,
          error: {
            code: BaiduMapErrorCode.UNKNOWN_ERROR,
            message: `所有坐标编码失败: ${errors.join(', ')}`,
          },
        };
      }

      return {
        success: true,
        data: results,
        message: errors.length > 0 ? `部分坐标编码失败: ${errors.join(', ')}` : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '批量逆地理编码失败',
          nativeError: error,
        },
      };
    }
  }
}

export default GeocodingModule;