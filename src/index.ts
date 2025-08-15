// 导出所有类型
export * from './types';

// 导出组件
export { MapView } from './components/MapView';
export { Marker } from './components/Marker';
export { Polyline } from './components/Polyline';
export { Polygon } from './components/Polygon';
export { InfoWindow } from './components/InfoWindow';

// 导出组件类型
export type {
  MapViewMethods,
  MapViewState,
  MarkerComponentProps,
  PolylineComponentProps,
  PolygonComponentProps,
  InfoWindowComponentProps,
} from './components';

// 导出模块
export { BaiduMapModule } from './modules/BaiduMapModule';
export { LocationModule } from './modules/LocationModule';

// 导出工具函数
export * from './utils';

// 版本信息
export const version = '1.0.0';

// SDK初始化便捷方法
export { initializeBaiduMap } from './utils/initialization';
