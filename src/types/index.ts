// 基础坐标和区域类型
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Point {
  x: number;
  y: number;
}

// 地图类型枚举
export enum MapType {
  NORMAL = 'normal',
  SATELLITE = 'satellite',
  HYBRID = 'hybrid',
}

// 定位模式枚举
export enum LocationMode {
  HIGH_ACCURACY = 'high_accuracy',
  BATTERY_SAVING = 'battery_saving',
  DEVICE_SENSORS = 'device_sensors',
}

// 坐标系类型枚举
export enum CoordinateType {
  BD09LL = 'bd09ll',
  BD09MC = 'bd09mc',
  GCJ02 = 'gcj02',
  WGS84 = 'wgs84',
}

// 定位结果接口
export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
  address?: string;
  city?: string;
  district?: string;
  province?: string;
  street?: string;
  streetNumber?: string;
  locationDescribe?: string;
  coordinateType?: CoordinateType;
}

// 地图事件类型
export interface MapClickEvent {
  coordinate: LatLng;
  screenPoint: Point;
}

export interface MapLongClickEvent {
  coordinate: LatLng;
  screenPoint: Point;
}

export interface MapStatusChangeEvent {
  center: LatLng;
  zoom: number;
  overlook: number;
  rotation: number;
  reason: MapStatusChangeReason;
}

export enum MapStatusChangeReason {
  GESTURE = 'gesture',
  API_ANIMATION = 'api_animation',
  DEVELOPER_ANIMATION = 'developer_animation',
}

// 标记相关类型
export interface MarkerProps {
  coordinate: LatLng;
  title?: string;
  description?: string;
  icon?: string | number;
  draggable?: boolean;
  visible?: boolean;
  zIndex?: number;
  alpha?: number;
  rotation?: number;
  flat?: boolean;
  anchor?: Point;
}

export interface MarkerClickEvent {
  coordinate: LatLng;
  title?: string;
  description?: string;
}

export interface MarkerDragEvent {
  coordinate: LatLng;
  state: MarkerDragState;
}

export enum MarkerDragState {
  START = 'start',
  DRAG = 'drag',
  END = 'end',
}

// 信息窗口类型
export interface InfoWindowProps {
  coordinate: LatLng;
  visible?: boolean;
  yOffset?: number;
}

// 覆盖物类型
export interface PolylineProps {
  coordinates: LatLng[];
  color?: string;
  width?: number;
  dottedLine?: boolean;
  zIndex?: number;
  visible?: boolean;
}

export interface PolygonProps {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  zIndex?: number;
  visible?: boolean;
}

export interface CircleProps {
  center: LatLng;
  radius: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  zIndex?: number;
  visible?: boolean;
}

// 错误处理类型
/**
 * @enum {string}
 * @description 统一错误码枚举
 */
export enum BaiduMapErrorCode {
  // --- 通用错误 (1000-1999) ---
  /** 未知错误 */
  GENERAL_UNKNOWN = '1000',
  /** 网络连接失败 */
  GENERAL_NETWORK_ERROR = '1001',
  /** 参数错误 */
  GENERAL_INVALID_PARAMETER = '1002',
  /** 原生层内部错误 */
  GENERAL_INTERNAL_ERROR = '1003',
  
  // 常用别名
  /** 未知错误 (别名) */
  UNKNOWN_ERROR = '1000',
  /** 网络错误 (别名) */
  NETWORK_ERROR = '1001',
  /** 参数无效 (别名) */
  INVALID_PARAMETER = '1002',
  /** 坐标无效 (别名) */
  INVALID_COORDINATE = '1004',

  // --- SDK 初始化 (2000-2999) ---
  /** SDK 未初始化 */
  INIT_SDK_NOT_INITIALIZED = '2000',
  /** API Key 无效或验证失败 */
  INIT_INVALID_API_KEY = '2001',
  /** 车牌号错误 (特定功能使用) */
  INIT_LICENSE_PLATE_ERROR = '2002',
  
  // 常用别名
  /** SDK 未初始化 (别名) */
  SDK_NOT_INITIALIZED = '2000',
  /** API Key 无效 (别名) */
  INVALID_API_KEY = '2001',

  // --- 定位服务 (3000-3999) ---
  /** 定位权限被拒绝 */
  LOCATION_PERMISSION_DENIED = '3000',
  /** 系统定位服务未开启 */
  LOCATION_SERVICE_DISABLED = '3001',
  /** 定位硬件不可用 (如 GPS 关闭) */
  LOCATION_HARDWARE_DISABLED = '3002',
  /** 定位超时 */
  LOCATION_TIMEOUT = '3003',
  /** 定位时网络错误 */
  LOCATION_NETWORK_ERROR = '3004',
  /** 定位失败 */
  LOCATION_FAILURE = '3005',

  // --- 地理编码与逆地理编码 (4000-4999) ---
  /** 不支持地理编码 */
  GEOCODING_NOT_SUPPORTED = '4000',
  /** 地址无效 */
  GEOCODING_INVALID_ADDRESS = '4001',
  /** 坐标无效 */
  GEOCODING_INVALID_COORDINATE = '4002',
  /** 未找到结果 */
  GEOCODING_NO_RESULT = '4003',
  /** 服务不可用 */
  GEOCODING_SERVICE_UNAVAILABLE = '4004',

  // --- 路线规划 (5000-5999) ---
  /** 不支持路线规划 */
  ROUTE_PLANNING_NOT_SUPPORTED = '5000',
  /** 起点无效 */
  ROUTE_PLANNING_INVALID_START_NODE = '5001',
  /** 终点无效 */
  ROUTE_PLANNING_INVALID_END_NODE = '5002',
  /** 未找到路线 */
  ROUTE_PLANNING_NO_RESULT = '5003',
  /** 服务不可用 */
  ROUTE_PLANNING_SERVICE_UNAVAILABLE = '5004',
  /** 没有权限 */
  ROUTE_PLANNING_PERMISSION_DENIED = '5005',

  // --- 地图渲染与加载 (6000-6999) ---
  /** 地图渲染错误 */
  MAP_RENDER_ERROR = '6000',
  /** 地图加载失败 */
  MAP_LOAD_ERROR = '6001',
  /** 自定义地图样式无效 */
  MAP_INVALID_CUSTOM_STYLE = '6002',
}

export interface BaiduMapError {
  code: BaiduMapErrorCode;
  message: string;
  nativeError?: any;
}

// 配置类型
export interface BaiduMapConfig {
  apiKey: string;
  enableLocation?: boolean;
  locationMode?: LocationMode;
  coordinateType?: CoordinateType;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  locationMode?: LocationMode;
  coordinateType?: CoordinateType;
  interval?: number;
  needAddress?: boolean;
  needLocationDescribe?: boolean;
  needLocationPoiList?: boolean;
}

// 地图视图属性类型
export interface MapViewProps {
  center?: LatLng;
  zoom?: number;
  mapType?: MapType;
  showsUserLocation?: boolean;
  userLocationAccuracyCircleEnabled?: boolean;
  showsCompass?: boolean;
  showsScale?: boolean;
  zoomControlsEnabled?: boolean;
  scrollGesturesEnabled?: boolean;
  zoomGesturesEnabled?: boolean;
  rotateGesturesEnabled?: boolean;
  overlookEnabled?: boolean;
  buildingsEnabled?: boolean;
  trafficEnabled?: boolean;
  baiduHeatMapEnabled?: boolean;
  onMapClick?: (event: MapClickEvent) => void;
  onMapLongClick?: (event: MapLongClickEvent) => void;
  onMapStatusChange?: (event: MapStatusChangeEvent) => void;
  onMapLoaded?: () => void;
}

// 权限相关类型
export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  NEVER_ASK_AGAIN = 'never_ask_again',
  UNKNOWN = 'unknown',
}

export interface PermissionResult {
  status: PermissionStatus;
  canRequestAgain: boolean;
}

// 工具函数返回类型
export interface CoordinateConvertResult {
  latitude: number;
  longitude: number;
  success: boolean;
  error?: string;
}

// 地图方法调用结果类型
export interface MapMethodResult<T = any> {
  success: boolean;
  data?: T;
  error?: BaiduMapError;
  message?: string;
}

// 导出所有事件类型的联合类型
export type MapEvent = MapClickEvent | MapLongClickEvent | MapStatusChangeEvent;
export type MarkerEvent = MarkerClickEvent | MarkerDragEvent;
// 向后兼容的别名
export const ErrorCode = BaiduMapErrorCode;
export type ErrorCode = BaiduMapErrorCode;