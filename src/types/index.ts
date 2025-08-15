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
export enum BaiduMapErrorCode {
  SDK_NOT_INITIALIZED = 'SDK_NOT_INITIALIZED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  LOCATION_SERVICE_DISABLED = 'LOCATION_SERVICE_DISABLED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_COORDINATE = 'INVALID_COORDINATE',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
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
}

// 导出所有事件类型的联合类型
export type MapEvent = MapClickEvent | MapLongClickEvent | MapStatusChangeEvent;
export type MarkerEvent = MarkerClickEvent | MarkerDragEvent;
