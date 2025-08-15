# Marker 组件

Marker 组件用于在地图上显示标记点，支持自定义图标、拖拽、点击事件等功能。

## 导入

```typescript
import { Marker } from '@react-native/winyh-baidu-map';
```

## 基础用法

```typescript
<MapView style={{ flex: 1 }}>
  <Marker
    coordinate={{ latitude: 39.915, longitude: 116.404 }}
    title="北京"
    description="中国首都"
  />
</MapView>
```

## Props

### coordinate
- **类型**: `LatLng`
- **必需**: 是
- **描述**: 标记的坐标位置

```typescript
interface LatLng {
  latitude: number;
  longitude: number;
}
```

### title
- **类型**: `string`
- **必需**: 否
- **描述**: 标记的标题，点击标记时显示

### description
- **类型**: `string`
- **必需**: 否
- **描述**: 标记的描述信息，点击标记时显示

### icon
- **类型**: `ImageSourcePropType`
- **必需**: 否
- **描述**: 自定义标记图标

```typescript
// 使用本地图片
<Marker
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  icon={require('./assets/custom-marker.png')}
/>

// 使用网络图片
<Marker
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  icon={{ uri: 'https://example.com/marker.png' }}
/>
```

### draggable
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 是否允许拖拽标记

### visible
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 标记是否可见

### zIndex
- **类型**: `number`
- **必需**: 否
- **默认值**: `0`
- **描述**: 标记的层级，数值越大越在上层

### anchor
- **类型**: `{ x: number; y: number }`
- **必需**: 否
- **默认值**: `{ x: 0.5, y: 1.0 }`
- **描述**: 标记图标的锚点，相对于图标的位置

```typescript
// 锚点在图标中心
<Marker
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  anchor={{ x: 0.5, y: 0.5 }}
/>
```

### rotation
- **类型**: `number`
- **必需**: 否
- **默认值**: `0`
- **描述**: 标记的旋转角度（度）

### alpha
- **类型**: `number`
- **必需**: 否
- **默认值**: `1.0`
- **范围**: `0.0-1.0`
- **描述**: 标记的透明度

### flat
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 标记是否平贴地面

### perspective
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 标记是否支持透视效果

## 事件回调

### onPress
- **类型**: `() => void`
- **描述**: 点击标记时触发

```typescript
<Marker
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  onPress={() => {
    console.log('标记被点击');
  }}
/>
```

### onDragStart
- **类型**: `(coordinate: LatLng) => void`
- **描述**: 开始拖拽标记时触发

### onDrag
- **类型**: `(coordinate: LatLng) => void`
- **描述**: 拖拽标记过程中触发

### onDragEnd
- **类型**: `(coordinate: LatLng) => void`
- **描述**: 拖拽标记结束时触发

```typescript
<Marker
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  draggable={true}
  onDragStart={(coordinate) => console.log('开始拖拽:', coordinate)}
  onDrag={(coordinate) => console.log('拖拽中:', coordinate)}
  onDragEnd={(coordinate) => console.log('拖拽结束:', coordinate)}
/>
```

### onCalloutPress
- **类型**: `() => void`
- **描述**: 点击标记的信息窗口时触发

## 子组件

Marker 可以包含自定义的子组件作为标记内容：

```typescript
<Marker coordinate={{ latitude: 39.915, longitude: 116.404 }}>
  <View style={styles.customMarker}>
    <Text style={styles.markerText}>自定义</Text>
  </View>
</Marker>
```

## 完整示例

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { MapView, Marker, LatLng } from '@react-native/winyh-baidu-map';

const MarkerExample = () => {
  const [markerPosition, setMarkerPosition] = useState<LatLng>({
    latitude: 39.915,
    longitude: 116.404,
  });

  const [markers, setMarkers] = useState([
    {
      id: 1,
      coordinate: { latitude: 39.915, longitude: 116.404 },
      title: '北京',
      description: '中国首都',
    },
    {
      id: 2,
      coordinate: { latitude: 39.925, longitude: 116.414 },
      title: '天安门',
      description: '著名景点',
    },
  ]);

  const handleMarkerPress = (title: string) => {
    Alert.alert('标记点击', `您点击了: ${title}`);
  };

  const handleDragEnd = (coordinate: LatLng) => {
    setMarkerPosition(coordinate);
    Alert.alert(
      '拖拽完成',
      `新位置: ${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={markerPosition}
        zoom={12}
      >
        {/* 普通标记 */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => handleMarkerPress(marker.title)}
          />
        ))}

        {/* 可拖拽标记 */}
        <Marker
          coordinate={markerPosition}
          title="可拖拽标记"
          description="拖拽我试试"
          draggable={true}
          onDragEnd={handleDragEnd}
          icon={require('./assets/draggable-marker.png')}
        />

        {/* 自定义标记 */}
        <Marker coordinate={{ latitude: 39.905, longitude: 116.394 }}>
          <View style={styles.customMarker}>
            <Text style={styles.customMarkerText}>自定义</Text>
          </View>
        </Marker>

        {/* 旋转标记 */}
        <Marker
          coordinate={{ latitude: 39.935, longitude: 116.424 }}
          title="旋转标记"
          rotation={45}
          alpha={0.8}
        />

        {/* 平贴地面标记 */}
        <Marker
          coordinate={{ latitude: 39.895, longitude: 116.384 }}
          title="平贴标记"
          flat={true}
          icon={require('./assets/flat-marker.png')}
        />
      </MapView>
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
  customMarker: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  customMarkerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MarkerExample;
```

## 动态标记管理

```typescript
import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';

const DynamicMarkerExample = () => {
  const [markers, setMarkers] = useState<Array<{id: number, coordinate: LatLng, title: string}>>([]);
  const [nextId, setNextId] = useState(1);

  const addRandomMarker = () => {
    const newMarker = {
      id: nextId,
      coordinate: {
        latitude: 39.915 + (Math.random() - 0.5) * 0.1,
        longitude: 116.404 + (Math.random() - 0.5) * 0.1,
      },
      title: `标记 ${nextId}`,
    };
    
    setMarkers(prev => [...prev, newMarker]);
    setNextId(prev => prev + 1);
  };

  const removeMarker = (id: number) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  const clearAllMarkers = () => {
    setMarkers([]);
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            onPress={() => removeMarker(marker.id)}
          />
        ))}
      </MapView>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={addRandomMarker}>
          <Text style={styles.buttonText}>添加标记</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearAllMarkers}>
          <Text style={styles.buttonText}>清空标记</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

## 性能优化建议

1. **大量标记**: 当需要显示大量标记时，考虑使用标记聚合功能
2. **动态更新**: 避免频繁添加/删除标记，批量操作更高效
3. **图标缓存**: 重复使用的图标应该缓存，避免重复加载
4. **内存管理**: 及时清理不需要的标记，避免内存泄漏

## 注意事项

1. **坐标系统**: 确保使用正确的坐标系统（BD09、GCJ02、WGS84）
2. **图标尺寸**: 自定义图标建议使用合适的尺寸，避免过大影响性能
3. **事件处理**: 拖拽事件可能会影响地图的其他交互，需要合理处理
4. **层级管理**: 使用 zIndex 合理管理标记的显示层级

## 相关组件

- [MapView](./MapView.md) - 地图视图组件
- [InfoWindow](./InfoWindow.md) - 信息窗口组件
- [Polyline](./Polyline.md) - 折线覆盖物
- [Polygon](./Polygon.md) - 多边形覆盖物