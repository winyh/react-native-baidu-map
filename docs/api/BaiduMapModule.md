# BaiduMapModule 模块

`BaiduMapModule` 是百度地图 SDK 的核心模块，负责 SDK 的初始化、配置、坐标转换、地图控制等基础功能。

## 导入

```typescript
import { BaiduMapModule } from '@react-native/winyh-baidu-map';
```

## 核心方法

### setAgreePrivacy
设置隐私政策同意状态。**必须在 `initialize` 之前调用**。

```typescript
static async setAgreePrivacy(agree: boolean): Promise<MapMethodResult>
```

**参数**:
- `agree`: `boolean` - 是否同意隐私政策。

**示例**:
```typescript
await BaiduMapModule.setAgreePrivacy(true);
```

### initialize
初始化百度地图 SDK。一个应用生命周期内只需调用一次。

```typescript
static async initialize(config: BaiduMapConfig): Promise<MapMethodResult>
```

**参数**:
- `config`: `BaiduMapConfig` - SDK 初始化配置对象。

**示例**:
```typescript
const result = await BaiduMapModule.initialize({
  apiKey: 'YOUR_API_KEY_HERE',
  enableLocation: true,
});

if (result.success) {
  console.log('SDK 初始化成功');
} else {
  console.error('SDK 初始化失败:', result.error);
}
```

### isSDKInitialized
检查 SDK 是否已经初始化成功。

```typescript
static async isSDKInitialized(): Promise<boolean>
```

**返回值**: `Promise<boolean>` - 如果已初始化则返回 `true`，否则返回 `false`。

**示例**:
```typescript
const isInitialized = await BaiduMapModule.isSDKInitialized();
if (!isInitialized) {
  // 进行初始化
}
```

### getSDKVersion
获取百度地图 SDK 的版本号。

```typescript
static async getSDKVersion(): Promise<MapMethodResult<string>>
```

**返回值**: `Promise<MapMethodResult<string>>` - 包含版本号字符串的结果对象。

**示例**:
```typescript
const versionResult = await BaiduMapModule.getSDKVersion();
if (versionResult.success) {
  console.log('SDK 版本:', versionResult.data);
}
```

### clearMapCache
清除地图缓存，包括瓦片图数据。

```typescript
static async clearMapCache(): Promise<MapMethodResult>
```

**示例**:
```typescript
await BaiduMapModule.clearMapCache();
```

## 坐标转换

### convertCoordinate
将单个坐标从源坐标系转换为目标坐标系。

```typescript
static async convertCoordinate(
  coordinate: LatLng,
  from: CoordinateType,
  to: CoordinateType
): Promise<CoordinateConvertResult>
```

**参数**:
- `coordinate`: `LatLng` - 要转换的坐标。
- `from`: `CoordinateType` - 源坐标系。
- `to`: `CoordinateType` - 目标坐标系。

**返回值**: `Promise<CoordinateConvertResult>` - 包含转换后坐标的结果对象。

**示例**:
```typescript
const wgs84Coord = { latitude: 39.9, longitude: 116.3 };
const bd09Coord = await BaiduMapModule.convertCoordinate(wgs84Coord, 'wgs84', 'bd09ll');
if (bd09Coord.success) {
  console.log('转换后坐标:', bd09Coord.latitude, bd09Coord.longitude);
}
```

### convertCoordinates
批量转换坐标。

```typescript
static async convertCoordinates(
  coordinates: LatLng[],
  from: CoordinateType,
  to: CoordinateType
): Promise<CoordinateConvertResult[]>
```

**示例**:
```typescript
const wgs84Coords = [
  { latitude: 39.9, longitude: 116.3 },
  { latitude: 31.2, longitude: 121.4 },
];
const bd09Coords = await BaiduMapModule.convertCoordinates(wgs84Coords, 'wgs84', 'bd09ll');
```

## 地图控制与定制

### animateToLocation
以动画方式将地图中心点移动到指定位置。

```typescript
static async animateToLocation(options: { latitude: number; longitude: number; duration: number; }): Promise<void>
```

**示例**:
```typescript
await BaiduMapModule.animateToLocation({
  latitude: 39.915,
  longitude: 116.404,
  duration: 1500, // 动画时长1.5秒
});
```

### animateToZoom
以动画方式将地图缩放到指定级别。

```typescript
static async animateToZoom(options: { zoomLevel: number; duration: number; }): Promise<void>
```

**示例**:
```typescript
await BaiduMapModule.animateToZoom({ zoomLevel: 15, duration: 1000 });
```

### takeSnapshot
对当前地图视图进行截图。

```typescript
static async takeSnapshot(options: any): Promise<any> // 返回值依赖于原生实现
```

### setMapCustomStyle
设置自定义地图样式。需要提供从百度地图开放平台获取的样式文件内容。

```typescript
static async setMapCustomStyle(styleOptions: { styleJson: string }): Promise<any>
```

**示例**:
```typescript
const style = require('./custom_map_style.json');
await BaiduMapModule.setMapCustomStyle({ styleJson: JSON.stringify(style) });
```

## 覆盖物

### addHeatMap
在地图上添加热力图。

```typescript
static async addHeatMap(dataPoints: any[], options: any): Promise<any>
```

### removeHeatMap
移除已添加的热力图。

```typescript
static async removeHeatMap(): Promise<any>
```

## 离线地图

### downloadOfflineMap
下载指定城市的离线地图数据。

```typescript
static async downloadOfflineMap(options: { cityId: string; cityName: string; }): Promise<{success: boolean, message: string}>
```

### getOfflineMapList
获取已下载或正在下载的离线地图列表。

```typescript
static async getOfflineMapList(): Promise<Array<{cityId: string, cityName: string, status: string}>>
```

## 接口定义

### BaiduMapConfig
初始化配置对象。
```typescript
interface BaiduMapConfig {
  apiKey: string;                    // 百度地图API密钥
  enableLocation?: boolean;          // 是否启用定位功能
  locationMode?: LocationMode;       // 定位模式
  coordinateType?: CoordinateType;   // 坐标系类型
  enableHttps?: boolean;            // 是否启用HTTPS
  enableDebug?: boolean;            // 是否启用调试模式
}
```

### MapMethodResult
大多数异步方法返回的结果对象结构。
```typescript
interface MapMethodResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: BaiduMapErrorCode | number;
    message: string;
    nativeError?: any;
  };
}
```

### CoordinateType
支持的坐标系类型。
```typescript
enum CoordinateType {
  BD09LL = 'bd09ll', // 百度经纬度坐标
  GCJ02 = 'gcj02',   // 国测局坐标
  WGS84 = 'wgs84',   // GPS坐标
}
```

## 错误处理

模块中的方法在执行失败时，会返回 `{ success: false, error: {...} }` 结构的对象，或直接抛出异常。建议使用 `try...catch` 块来处理调用。

### 常见错误码

| 错误码 | 描述 |
|---|---|
| `SDK_NOT_INITIALIZED` | 原生模块未找到或SDK未初始化 |
| `INVALID_API_KEY` | 无效的 API Key |
| `INVALID_PARAMETER` | 调用时传入了无效参数 |
| `UNKNOWN_ERROR` | 未知或原生模块抛出的其他错误 |

## 最佳实践

1.  **尽早初始化**: 在应用的根组件（如 `App.tsx`）中尽早执行 `setAgreePrivacy` 和 `initialize`，确保在使用其他地图功能前 SDK 已就绪。
2.  **状态检查**: 在调用地图功能前，可以通过 `isSDKInitialized` 确认初始化状态，避免不必要的错误。
3.  **统一配置**: 将 `BaiduMapConfig` 存放在统一的配置文件中，方便管理不同环境（开发/生产）的配置。

## 相关模块

- [LocationModule](./LocationModule.md) - 定位服务模块
- [GeocodingModule](./GEOCODING_API.md) - 地理编码与POI搜索
- [RoutePlanningModule](./RoutePlanningModule.md) - 路径规划与导航
