import { NativeModules } from 'react-native';
import {
  LatLng,
  ErrorCode,
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
  static async geocoding(address: string, city?: string): Promise<GeocodingResult> {
    if (!NativeGeocodingModule) {
      throw Object.assign(new Error('地理编码模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (!address || address.trim().length === 0) {
      throw Object.assign(new Error('地址不能为空'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    return await NativeGeocodingModule.geocoding(address, city);
  }

  /**
   * 逆地理编码 - 将坐标转换为地址
   */
  static async reverseGeocoding(
    coordinate: LatLng,
    radius?: number
  ): Promise<ReverseGeocodingResult> {
    if (!NativeGeocodingModule) {
      throw Object.assign(new Error('地理编码模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (!coordinate || typeof coordinate.latitude !== 'number' || typeof coordinate.longitude !== 'number') {
      throw Object.assign(new Error('坐标参数无效'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    return await NativeGeocodingModule.reverseGeocoding(coordinate, radius || 1000);
  }

  /**
   * POI搜索
   */
  static async searchPOI(options: POISearchOptions): Promise<POISearchResult> {
    if (!NativeGeocodingModule) {
      throw Object.assign(new Error('地理编码模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (!options.keyword || options.keyword.trim().length === 0) {
      throw Object.assign(new Error('搜索关键词不能为空'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    const searchOptions = {
      ...options,
      pageIndex: options.pageIndex || 0,
      pageSize: options.pageSize || 10,
      scope: options.scope || 1,
    };

    return await NativeGeocodingModule.searchPOI(searchOptions);
  }

  /**
   * 周边搜索
   */
  static async searchNearby(options: NearbySearchOptions): Promise<POISearchResult> {
    if (!NativeGeocodingModule) {
      throw Object.assign(new Error('地理编码模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (!options.location || typeof options.location.latitude !== 'number' || typeof options.location.longitude !== 'number') {
      throw Object.assign(new Error('搜索位置参数无效'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    if (!options.radius || options.radius <= 0) {
      throw Object.assign(new Error('搜索半径必须大于0'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    const searchOptions = {
      ...options,
      pageIndex: options.pageIndex || 0,
      pageSize: options.pageSize || 10,
      sortType: options.sortType || 'distance',
    };

    return await NativeGeocodingModule.searchNearby(searchOptions);
  }

  /**
   * 搜索建议
   */
  static async searchSuggestion(options: SuggestionSearchOptions): Promise<SuggestionInfo[]> {
    if (!NativeGeocodingModule) {
      throw Object.assign(new Error('地理编码模块未找到'), {
        code: ErrorCode.INIT_SDK_NOT_INITIALIZED,
      });
    }

    if (!options.keyword || options.keyword.trim().length === 0) {
      throw Object.assign(new Error('搜索关键词不能为空'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    const searchOptions = {
      ...options,
      cityLimit: options.cityLimit !== false, // 默认限制城市
    };

    return await NativeGeocodingModule.searchSuggestion(searchOptions);
  }

  /**
   * 批量地理编码
   */
  static async batchGeocoding(addresses: string[], city?: string): Promise<GeocodingResult[]> {
    if (!addresses || addresses.length === 0) {
      throw Object.assign(new Error('地址列表不能为空'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    const results = await Promise.allSettled(
      addresses.map(address => this.geocoding(address, city))
    );

    const successfulResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<GeocodingResult>).value);

    if (successfulResults.length === 0) {
      throw new Error('所有地址编码失败');
    }

    return successfulResults;
  }

  /**
   * 批量逆地理编码
   */
  static async batchReverseGeocoding(
    coordinates: LatLng[],
    radius?: number
  ): Promise<ReverseGeocodingResult[]> {
    if (!coordinates || coordinates.length === 0) {
      throw Object.assign(new Error('坐标列表不能为空'), {
        code: ErrorCode.GENERAL_INVALID_PARAMETER,
      });
    }

    const results = await Promise.allSettled(
      coordinates.map(coordinate => this.reverseGeocoding(coordinate, radius))
    );

    const successfulResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<ReverseGeocodingResult>).value);

    if (successfulResults.length === 0) {
      throw new Error('所有坐标编码失败');
    }

    return successfulResults;
  }
}

export default GeocodingModule;