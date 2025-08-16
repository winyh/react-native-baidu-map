
# LocationModule 模块

`LocationModule` 提供了访问用户地理位置信息的核心功能，包括单次定位、连续定位、权限管理和定位服务状态检查。

## 导入

```typescript
import { LocationModule } from '@react-native/winyh-baidu-map';
```

## 方法

### 权限管理

#### checkLocationPermission
检查当前的定位权限状态。

```typescript
static async checkLocationPermission(): Promise<PermissionResult>
```

**返回值**: `Promise<PermissionResult>` - 一个包含权限状态的对象。

**示例**:
```typescript
const permission = await LocationModule.checkLocationPermission();
if (permission.status === 'granted') {
  console.log('已授予定位权限');
} else {
  console.log('未授予定位权限');
}
```

#### requestLocationPermission
请求定位权限。仅在 Android 上需要，iOS 会在首次使用时自动弹出请求。

```typescript
static async requestLocationPermission(): Promise<PermissionResult>
```

**返回值**: `Promise<PermissionResult>` - 一个包含用户授权结果的对象。

**示例**:
```typescript
const result = await LocationModule.requestLocationPermission();
if (result.status === 'granted') {
  console.log('用户已授权');
} else if (result.status === 'denied') {
  console.log('用户已拒绝');
} else if (result.status === 'never_ask_again') {
  console.log('用户选择了“不再询问”');
}
```

### 获取位置

#### getCurrentLocation
获取用户当前的地理位置（单次定位）。

```typescript
static async getCurrentLocation(options?: LocationOptions): Promise<LocationResult>
```

**参数**:
- `options` (可选): `LocationOptions` - 定位选项配置。

**返回值**: `Promise<LocationResult>` - 包含位置信息的对象。

**示例**:
```typescript
try {
  const location = await LocationModule.getCurrentLocation({
    needAddress: true,
    coordinateType: 'gcj02',
  });
  console.log('当前位置:', location);
} catch (error) {
  console.error('获取位置失败:', error);
}
```

#### watchPosition
开始连续监听用户位置变化。

```typescript
static watchPosition(
  successCallback: (location: LocationResult) => void,
  errorCallback?: (error: BaiduMapError) => void,
  options?: LocationOptions
): number
```

**参数**:
- `successCallback`: `(location: LocationResult) => void` - 成功获取位置时的回调函数。
- `errorCallback` (可选): `(error: BaiduMapError) => void` - 获取位置失败时的回调函数。
- `options` (可选): `LocationOptions` - 定位选项配置。

**返回值**: `number` - 一个唯一的 watch ID，用于停止监听。

**示例**:
```typescript
const watchId = LocationModule.watchPosition(
  (location) => {
    console.log('位置更新:', location);
  },
  (error) => {
    console.error('监听失败:', error);
  },
  { interval: 5000 } // 每5秒更新一次
);
```

#### clearWatch
停止指定 ID 的位置监听。

```typescript
static clearWatch(watchId: number): void
```

**参数**:
- `watchId`: `number` - `watchPosition` 返回的 ID。

**示例**:
```typescript
LocationModule.clearWatch(watchId);
```

#### clearAllWatches
停止所有正在进行的位置监听。

```typescript
static clearAllWatches(): void
```

**示例**:
```typescript
LocationModule.clearAllWatches();
```

### 服务与配置

#### isLocationServiceEnabled
检查设备的定位服务是否已开启。

```typescript
static async isLocationServiceEnabled(): Promise<boolean>
```

**返回值**: `Promise<boolean>` - `true` 表示已开启，`false` 表示未开启。

**示例**:
```typescript
const isEnabled = await LocationModule.isLocationServiceEnabled();
if (!isEnabled) {
  Alert.alert('提示', '请在系统设置中开启定位服务');
}
```

#### getLocationConfig
获取当前定位模块的配置信息。

```typescript
static async getLocationConfig(): Promise<MapMethodResult<{...}>>
```

**返回值**: `Promise<MapMethodResult<object>>` - 包含当前配置的对象。

**示例**:
```typescript
const configResult = await LocationModule.getLocationConfig();
if (configResult.success) {
  console.log('当前定位配置:', configResult.data);
}
```

## 接口和枚举

### LocationOptions
定位请求的配置选项。

```typescript
interface LocationOptions {
  enableHighAccuracy?: boolean;      // 是否使用高精度定位，默认 true
  timeout?: number;                  // 超时时间（毫秒），默认 15000
  maximumAge?: number;               // 位置缓存的最大有效时间（毫秒），默认 60000
  interval?: number;                 // (仅用于 watchPosition) 定位间隔（毫秒），默认 5000
  locationMode?: LocationMode;       // 定位模式
  coordinateType?: CoordinateType;   // 坐标系类型
  needAddress?: boolean;             // 是否需要返回地址信息，默认 true
  needLocationDescribe?: boolean;    // 是否需要返回位置描述，默认 true
  needLocationPoiList?: boolean;     // 是否需要返回周边POI信息，默认 false
}
```

### LocationResult
成功获取位置时返回的数据结构。

```typescript
interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
  address?: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  locationDescribe?: string;
  poiList?: any[];
}
```

### PermissionResult & PermissionStatus
权限请求返回的结果。

```typescript
interface PermissionResult {
  status: PermissionStatus;
  canRequestAgain: boolean; // (Android only) 是否可以再次请求
}

enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  NEVER_ASK_AGAIN = 'never_ask_again', // (Android only)
  UNKNOWN = 'unknown',
}
```

## 完整示例

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { LocationModule, LocationResult, BaiduMapError, PermissionStatus } from '@react-native/winyh-baidu-map';

const LocationExample = () => {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [error, setError] = useState<BaiduMapError | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    // 组件卸载时停止监听
    return () => {
      if (watchId) {
        LocationModule.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const handleGetLocation = async () => {
    try {
      // 1. 检查权限
      let permission = await LocationModule.checkLocationPermission();
      if (permission.status !== PermissionStatus.GRANTED) {
        permission = await LocationModule.requestLocationPermission();
      }

      if (permission.status !== PermissionStatus.GRANTED) {
        Alert.alert('权限不足', '无法获取位置信息');
        return;
      }

      // 2. 检查定位服务
      const serviceEnabled = await LocationModule.isLocationServiceEnabled();
      if (!serviceEnabled) {
        Alert.alert('服务未开启', '请在系统设置中开启定位服务');
        return;
      }

      // 3. 获取位置
      const currentLocation = await LocationModule.getCurrentLocation({
        needAddress: true,
        needLocationDescribe: true,
      });
      setLocation(currentLocation);
      setError(null);
    } catch (e) {
      setError(e as BaiduMapError);
      setLocation(null);
    }
  };

  const handleToggleWatch = () => {
    if (watchId) {
      // 停止监听
      LocationModule.clearWatch(watchId);
      setWatchId(null);
      Alert.alert('状态', '已停止位置监听');
    } else {
      // 开始监听
      const newWatchId = LocationModule.watchPosition(
        (newLocation) => {
          console.log('位置更新:', newLocation.latitude, newLocation.longitude);
          setLocation(newLocation);
          setError(null);
        },
        (e) => {
          setError(e);
          setLocation(null);
        },
        { interval: 3000 }
      );
      setWatchId(newWatchId);
      Alert.alert('状态', '已开始位置监听');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>定位功能示例</Text>
      <View style={styles.buttonContainer}>
        <Button title="获取当前位置" onPress={handleGetLocation} />
        <Button
          title={watchId ? '停止监听' : '开始监听'}
          onPress={handleToggleWatch}
          color={watchId ? '#FF6347' : '#4682B4'}
        />
      </View>
      {location && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>定位成功:</Text>
          <Text>经度: {location.longitude}</Text>
          <Text>纬度: {location.latitude}</Text>
          <Text>地址: {location.address || 'N/A'}</Text>
          <Text>描述: {location.locationDescribe || 'N/A'}</Text>
        </View>
      )}
      {error && (
        <View style={styles.resultContainer}>
          <Text style={styles.errorTitle}>定位失败:</Text>
          <Text>错误码: {error.code}</Text>
          <Text>信息: {error.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  resultContainer: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  resultTitle: { fontWeight: 'bold', fontSize: 16 },
  errorTitle: { fontWeight: 'bold', fontSize: 16, color: 'red' },
});

export default LocationExample;
```

## 错误处理

`LocationModule` 的方法在失败时会抛出 `BaiduMapError` 类型的异常。

### 常见错误码

| 错误码 | 描述 | 建议处理 |
|--------|------|----------|
| `LOCATION_PERMISSION_DENIED` | 定位权限被拒绝 | 提示用户开启权限 |
| `SDK_NOT_INITIALIZED` | 百度地图SDK未初始化 | 确保在使用前已调用 `BaiduMapModule.initialize` |
| `LOCATION_SERVICE_DISABLED` | 设备定位服务未开启 | 提示用户去系统设置中开启 |
| `LOCATION_FAILED` | 定位失败（网络或硬件原因） | 提示用户检查网络或稍后重试 |
| `UNKNOWN_ERROR` | 未知错误 | 显示通用错误信息 |

### 错误处理示例

```typescript
import { BaiduMapErrorCode } from '@react-native/winyh-baidu-map';

// ...
try {
  const location = await LocationModule.getCurrentLocation();
} catch (error: any) {
  switch (error.code) {
    case BaiduMapErrorCode.LOCATION_PERMISSION_DENIED:
      Alert.alert('权限错误', '请在应用设置中授予定位权限');
      break;
    case BaiduMapErrorCode.LOCATION_SERVICE_DISABLED:
      Alert.alert('服务未开启', '请在系统设置中开启定位服务');
      break;
    default:
      Alert.alert('定位失败', error.message || '未知错误');
  }
}
```

## 最佳实践

1.  **权限先行**: 在调用任何定位功能前，务必使用 `checkLocationPermission` 和 `requestLocationPermission` 确保已获得授权。
2.  **服务检查**: 在定位前，使用 `isLocationServiceEnabled` 检查设备定位服务是否开启，并引导用户开启。
3.  **资源清理**: 在组件卸载（`useEffect` 的清理函数中）或不再需要定位时，调用 `clearWatch` 或 `clearAllWatches` 停止监听，以节省电量和资源。
4.  **按需定位**: 仅在需要时获取位置。对于只需要用户当前位置的场景，使用 `getCurrentLocation` 而不是 `watchPosition`。
5.  **合理配置**: 根据应用场景调整 `LocationOptions`。例如，导航应用需要高精度和频繁更新，而天气应用可能只需要低精度和较长的更新间隔。

## 相关模块

- [BaiduMapModule](./BaiduMapModule.md) - SDK核心模块，负责初始化。
- [MapView](./MapView.md) - 地图显示组件，可展示定位结果。
- [GeocodingModule](./GeocodingModule.md) - 地理编码与反地理编码模块。
