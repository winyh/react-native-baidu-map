import { NativeModules } from 'react-native';
import {
  LatLng,
  MapMethodResult,
  BaiduMapErrorCode,
} from '../types';

const { BaiduRoutePlanningModule: NativeRoutePlanningModule } = NativeModules;

export interface RouteNode {
  location: LatLng;
  name?: string;
  uid?: string;
}

export interface DrivingRouteOptions {
  origin: RouteNode;
  destination: RouteNode;
  waypoints?: RouteNode[];
  policy?: 'time_first' | 'distance_first' | 'fee_first' | 'traffic_first';
  trafficPolicy?: 'default' | 'real_traffic' | 'history_traffic';
}

export interface WalkingRouteOptions {
  origin: RouteNode;
  destination: RouteNode;
}

export interface TransitRouteOptions {
  origin: RouteNode;
  destination: RouteNode;
  city: string;
  policy?: 'time_first' | 'transfer_first' | 'walk_first' | 'fee_first';
}

export interface BikeRouteOptions {
  origin: RouteNode;
  destination: RouteNode;
  ridingType?: 'common' | 'electric';
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  direction: number;
  wayPoints: LatLng[];
  entryLocation?: LatLng;
  exitLocation?: LatLng;
  roadName?: string;
  tollDistance?: number;
  tollGateNumber?: number;
  trafficLightNumber?: number;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  steps: RouteStep[];
  wayPoints: LatLng[];
  startLocation: LatLng;
  endLocation: LatLng;
  toll?: number;
  trafficLightNumber?: number;
  congestionDistance?: number;
}

export interface DrivingRouteResult {
  routes: RouteInfo[];
  taxiInfo?: {
    description: string;
    totalPrice: number;
    fuelPrice: number;
    tollPrice: number;
  };
}

export interface TransitStep {
  instruction: string;
  distance: number;
  duration: number;
  wayPoints: LatLng[];
  vehicleInfo?: {
    title: string;
    name: string;
    startTime: string;
    endTime: string;
    price: number;
    type: number;
    zonePrice: number;
  };
  entryLocation?: LatLng;
  exitLocation?: LatLng;
}

export interface TransitRouteResult {
  routes: {
    distance: number;
    duration: number;
    steps: TransitStep[];
    wayPoints: LatLng[];
    startLocation: LatLng;
    endLocation: LatLng;
    price: number;
  }[];
}

export interface NavigationOptions {
  routeInfo: RouteInfo;
  simulateNavigation?: boolean;
  voiceEnabled?: boolean;
  nightMode?: boolean;
  showCompass?: boolean;
  showZoom?: boolean;
}

export class RoutePlanningModule {
  /**
   * 驾车路径规划
   */
  static async planDrivingRoute(options: DrivingRouteOptions): Promise<MapMethodResult<DrivingRouteResult>> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    if (!options.origin || !options.destination) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '起点和终点不能为空',
        },
      };
    }

    try {
      const planOptions = {
        ...options,
        policy: options.policy || 'time_first',
        trafficPolicy: options.trafficPolicy || 'default',
      };

      const result = await NativeRoutePlanningModule.planDrivingRoute(planOptions);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '驾车路径规划失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 步行路径规划
   */
  static async planWalkingRoute(options: WalkingRouteOptions): Promise<MapMethodResult<RouteInfo>> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    if (!options.origin || !options.destination) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '起点和终点不能为空',
        },
      };
    }

    try {
      const result = await NativeRoutePlanningModule.planWalkingRoute(options);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '步行路径规划失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 公交路径规划
   */
  static async planTransitRoute(options: TransitRouteOptions): Promise<MapMethodResult<TransitRouteResult>> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    if (!options.origin || !options.destination || !options.city) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '起点、终点和城市不能为空',
        },
      };
    }

    try {
      const planOptions = {
        ...options,
        policy: options.policy || 'time_first',
      };

      const result = await NativeRoutePlanningModule.planTransitRoute(planOptions);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '公交路径规划失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 骑行路径规划
   */
  static async planBikeRoute(options: BikeRouteOptions): Promise<MapMethodResult<RouteInfo>> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    if (!options.origin || !options.destination) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '起点和终点不能为空',
        },
      };
    }

    try {
      const planOptions = {
        ...options,
        ridingType: options.ridingType || 'common',
      };

      const result = await NativeRoutePlanningModule.planBikeRoute(planOptions);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '骑行路径规划失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 启动导航
   */
  static async startNavigation(options: NavigationOptions): Promise<MapMethodResult> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    if (!options.routeInfo) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.INVALID_PARAMETER,
          message: '路径信息不能为空',
        },
      };
    }

    try {
      const navOptions = {
        ...options,
        simulateNavigation: options.simulateNavigation || false,
        voiceEnabled: options.voiceEnabled !== false,
        nightMode: options.nightMode || false,
        showCompass: options.showCompass !== false,
        showZoom: options.showZoom !== false,
      };

      const result = await NativeRoutePlanningModule.startNavigation(navOptions);
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '启动导航失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 停止导航
   */
  static async stopNavigation(): Promise<MapMethodResult> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    try {
      const result = await NativeRoutePlanningModule.stopNavigation();
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '停止导航失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 暂停导航
   */
  static async pauseNavigation(): Promise<MapMethodResult> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    try {
      const result = await NativeRoutePlanningModule.pauseNavigation();
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '暂停导航失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 恢复导航
   */
  static async resumeNavigation(): Promise<MapMethodResult> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    try {
      const result = await NativeRoutePlanningModule.resumeNavigation();
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '恢复导航失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 获取导航状态
   */
  static async getNavigationStatus(): Promise<MapMethodResult<{
    isNavigating: boolean;
    isPaused: boolean;
    remainingDistance: number;
    remainingTime: number;
    currentStepIndex: number;
    currentInstruction: string;
  }>> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    try {
      const result = await NativeRoutePlanningModule.getNavigationStatus();
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '获取导航状态失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 设置导航语音
   */
  static async setNavigationVoice(enabled: boolean, voiceMode?: 'normal' | 'concise'): Promise<MapMethodResult> {
    if (!NativeRoutePlanningModule) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.SDK_NOT_INITIALIZED,
          message: '路径规划模块未找到',
        },
      };
    }

    try {
      const result = await NativeRoutePlanningModule.setNavigationVoice(enabled, voiceMode || 'normal');
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: BaiduMapErrorCode.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : '设置导航语音失败',
          nativeError: error,
        },
      };
    }
  }

  /**
   * 计算两点间距离
   */
  static calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371000; // 地球半径，单位米
    const lat1Rad = (point1.latitude * Math.PI) / 180;
    const lat2Rad = (point2.latitude * Math.PI) / 180;
    const deltaLatRad = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLngRad = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * 计算路径总距离
   */
  static calculateRouteDistance(wayPoints: LatLng[]): number {
    if (!wayPoints || wayPoints.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 0; i < wayPoints.length - 1; i++) {
      totalDistance += this.calculateDistance(wayPoints[i], wayPoints[i + 1]);
    }

    return totalDistance;
  }

  /**
   * 格式化距离显示
   */
  static formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}米`;
    } else if (distance < 10000) {
      return `${(distance / 1000).toFixed(1)}公里`;
    } else {
      return `${Math.round(distance / 1000)}公里`;
    }
  }

  /**
   * 格式化时间显示
   */
  static formatDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  }
}

export default RoutePlanningModule;