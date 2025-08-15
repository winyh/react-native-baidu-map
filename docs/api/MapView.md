# MapView 组件

MapView 是百度地图的核心显示组件，提供地图的基础显示和交互功能。

## 导入

```typescript
import { MapView } from '@react-native/winyh-baidu-map';
```

## 基础用法

```typescript
<MapView
  style={{ flex: 1 }}
  center={{ latitude: 39.915, longitude: 116.404 }}
  zoom={12}
  mapType={MapType.NORMAL}
/>
```

## Props

### style
- **类型**: `StyleProp<ViewStyle>`
- **必需**: 是
- **描述**: 地图容器的样式

### center
- **类型**: `LatLng`
- **必需**: 否
- **默认值**: `{ latitude: 39.915, longitude: 116.404 }`
- **描述**: 地图中心点坐标

```typescript
interface LatLng {
  latitude: number;
  longitude: number;
}
```

### zoom
- **类型**: `number`
- **必需**: 否
- **默认值**: `12`
- **范围**: `3-21`
- **描述**: 地图缩放级别

### mapType
- **类型**: `MapType`
- **必需**: 否
- **默认值**: `MapType.NORMAL`
- **描述**: 地图类型

```typescript
enum MapType {
  NORMAL = 'normal',      // 普通地图
  SATELLITE = 'satellite', // 卫星地图
  HYBRID = 'hybrid'       // 混合地图
}
```

### showsUserLocation
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 是否显示用户位置

### userLocationAccuracyCircleEnabled
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否显示用户位置精度圆圈

### showsCompass
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 是否显示指南针

### showsScale
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 是否显示比例尺

### zoomControlsEnabled
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否显示缩放控件

### scrollEnabled
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否允许地图滚动

### zoomEnabled
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否允许地图缩放

### rotateEnabled
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否允许地图旋转

### overlookEnabled
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否允许俯视角度

## 事件回调

### onMapLoaded
- **类型**: `() => void`
- **描述**: 地图加载完成时触发

```typescript
<MapView
  onMapLoaded={() => {
    console.log('地图加载完成');
  }}
/>
```

### onMapClick
- **类型**: `(coordinate: LatLng) => void`
- **描述**: 点击地图时触发

```typescript
<MapView
  onMapClick={(coordinate) => {
    console.log('点击位置:', coordinate);
  }}
/>
```

### onMapLongClick
- **类型**: `(coordinate: LatLng) => void`
- **描述**: 长按地图时触发

### onMapStatusChange
- **类型**: `(status: MapStatus) => void`
- **描述**: 地图状态改变时触发

```typescript
interface MapStatus {
  center: LatLng;
  zoom: number;
  rotation: number;
  overlook: number;
}
```

### onUserLocationUpdate
- **类型**: `(location: LocationResult) => void`
- **描述**: 用户位置更新时触发

## 方法

通过 ref 可以调用以下方法：

### setCenter
设置地图中心点

```typescript
const mapRef = useRef<MapViewMethods>(null);

// 设置中心点，带动画
await mapRef.current?.setCenter(
  { latitude: 39.915, longitude: 116.404 },
  true // 是否使用动画
);
```

### setZoom
设置地图缩放级别

```typescript
await mapRef.current?.setZoom(15, true);
```

### setMapType
设置地图类型

```typescript
await mapRef.current?.setMapType(MapType.SATELLITE);
```

### animateToRegion
动画移动到指定区域

```typescript
await mapRef.current?.animateToRegion({
  center: { latitude: 39.915, longitude: 116.404 },
  zoom: 15,
  duration: 1000 // 动画时长（毫秒）
});
```

### fitToCoordinates
调整地图以显示所有指定坐标点

```typescript
const coordinates = [
  { latitude: 39.915, longitude: 116.404 },
  { latitude: 39.925, longitude: 116.414 },
];

await mapRef.current?.fitToCoordinates(coordinates, {
  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
  animated: true
});
```

### takeSnapshot
截取地图快照

```typescript
const result = await mapRef.current?.takeSnapshot();
if (result.success) {
  console.log('截图保存到:', result.data);
}
```

### getCurrentPosition
获取地图当前状态

```typescript
const status = await mapRef.current?.getCurrentPosition();
console.log('当前地图状态:', status);
```

## 完整示例

```typescript
import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MapView, MapType, MapViewMethods, LatLng } from '@react-native/winyh-baidu-map';

const MapExample = () => {
  const mapRef = useRef<MapViewMethods>(null);
  const [mapType, setMapType] = useState<MapType>(MapType.NORMAL);
  const [center, setCenter] = useState<LatLng>({ latitude: 39.915, longitude: 116.404 });

  const handleMapClick = (coordinate: LatLng) => {
    console.log('点击位置:', coordinate);
    setCenter(coordinate);
  };

  const changeMapType = () => {
    const types = [MapType.NORMAL, MapType.SATELLITE, MapType.HYBRID];
    const currentIndex = types.indexOf(mapType);
    const nextType = types[(currentIndex + 1) % types.length];
    setMapType(nextType);
  };

  const moveToBeijing = async () => {
    const beijing = { latitude: 39.915, longitude: 116.404 };
    await mapRef.current?.animateToRegion({
      center: beijing,
      zoom: 12,
      duration: 1000
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        center={center}
        zoom={12}
        mapType={mapType}
        showsUserLocation={true}
        showsCompass={true}
        showsScale={true}
        onMapLoaded={() => console.log('地图加载完成')}
        onMapClick={handleMapClick}
        onMapStatusChange={(status) => console.log('地图状态:', status)}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={changeMapType}>
          <Text style={styles.buttonText}>切换地图类型</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={moveToBeijing}>
          <Text style={styles.buttonText}>移动到北京</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default MapExample;
```

## 注意事项

1. **性能优化**: 避免频繁更新地图状态，使用防抖处理用户交互
2. **内存管理**: 在组件卸载时清理地图资源
3. **权限处理**: 使用位置相关功能前确保已获取相应权限
4. **错误处理**: 监听地图加载失败等错误事件，提供用户友好的错误提示

## 相关组件

- [Marker](./Marker.md) - 地图标记
- [Polyline](./Polyline.md) - 折线覆盖物
- [Polygon](./Polygon.md) - 多边形覆盖物
- [InfoWindow](./InfoWindow.md) - 信息窗口