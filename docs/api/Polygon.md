# Polygon 组件

Polygon 组件用于在地图上绘制多边形区域，常用于显示行政区域、建筑轮廓、地理边界等面状数据。

## 导入

```typescript
import { Polygon } from '@react-native/winyh-baidu-map';
```

## 基础用法

```typescript
<MapView style={{ flex: 1 }}>
  <Polygon
    coordinates={[
      { latitude: 39.915, longitude: 116.404 },
      { latitude: 39.925, longitude: 116.414 },
      { latitude: 39.935, longitude: 116.424 },
      { latitude: 39.925, longitude: 116.434 },
      { latitude: 39.915, longitude: 116.424 },
    ]}
    fillColor="rgba(255, 0, 0, 0.3)"
    strokeColor="#FF0000"
    strokeWidth={2}
  />
</MapView>
```

## Props

### coordinates
- **类型**: `LatLng[]`
- **必需**: 是
- **描述**: 多边形的顶点坐标数组，至少需要3个点，首尾点会自动连接

```typescript
interface LatLng {
  latitude: number;
  longitude: number;
}

// 示例：绘制一个三角形
const triangleCoordinates = [
  { latitude: 39.915, longitude: 116.404 },
  { latitude: 39.925, longitude: 116.414 },
  { latitude: 39.935, longitude: 116.404 },
];
```

### fillColor
- **类型**: `string`
- **必需**: 否
- **默认值**: `"rgba(0, 0, 0, 0.3)"`
- **描述**: 多边形填充颜色，支持十六进制和 rgba 格式

```typescript
// 不同填充颜色示例
<Polygon coordinates={coordinates} fillColor="#FF0000" />        // 红色不透明
<Polygon coordinates={coordinates} fillColor="rgba(255, 0, 0, 0.5)" /> // 半透明红色
<Polygon coordinates={coordinates} fillColor="transparent" />    // 透明填充
```

### strokeColor
- **类型**: `string`
- **必需**: 否
- **默认值**: `"#000000"`
- **描述**: 多边形边框颜色

### strokeWidth
- **类型**: `number`
- **必需**: 否
- **默认值**: `1`
- **描述**: 多边形边框宽度（像素）

### visible
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 多边形是否可见

### zIndex
- **类型**: `number`
- **必需**: 否
- **默认值**: `0`
- **描述**: 多边形的层级，数值越大越在上层

### geodesic
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 边框是否绘制大圆弧线（地球表面最短路径）

### holes
- **类型**: `LatLng[][]`
- **必需**: 否
- **描述**: 多边形内部的洞，每个洞是一个坐标数组

```typescript
// 带洞的多边形示例
<Polygon
  coordinates={outerCoordinates}
  holes={[
    innerHole1Coordinates,
    innerHole2Coordinates,
  ]}
  fillColor="rgba(0, 255, 0, 0.5)"
/>
```

### dashed
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 边框是否绘制虚线

### dashPattern
- **类型**: `number[]`
- **必需**: 否
- **描述**: 虚线模式，数组表示实线和空白的长度

```typescript
// 虚线边框示例
<Polygon
  coordinates={coordinates}
  strokeColor="#FF0000"
  strokeWidth={2}
  dashed={true}
  dashPattern={[10, 5]} // 10像素实线，5像素空白
/>
```

### lineCap
- **类型**: `'butt' | 'round' | 'square'`
- **必需**: 否
- **默认值**: `'round'`
- **描述**: 边框端点样式

### lineJoin
- **类型**: `'miter' | 'round' | 'bevel'`
- **必需**: 否
- **默认值**: `'round'`
- **描述**: 边框连接点样式

## 事件回调

### onPress
- **类型**: `() => void`
- **描述**: 点击多边形时触发

```typescript
<Polygon
  coordinates={coordinates}
  onPress={() => {
    console.log('多边形被点击');
  }}
/>
```

## 完整示例

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { MapView, Polygon, LatLng } from '@react-native/winyh-baidu-map';

const PolygonExample = () => {
  // 北京市区域（简化）
  const beijingArea: LatLng[] = [
    { latitude: 39.8, longitude: 116.2 },
    { latitude: 39.8, longitude: 116.6 },
    { latitude: 40.1, longitude: 116.6 },
    { latitude: 40.1, longitude: 116.2 },
  ];

  // 天安门广场区域
  const tiananmenSquare: LatLng[] = [
    { latitude: 39.903, longitude: 116.391 },
    { latitude: 39.903, longitude: 116.398 },
    { latitude: 39.908, longitude: 116.398 },
    { latitude: 39.908, longitude: 116.391 },
  ];

  // 带洞的多边形示例
  const outerRing: LatLng[] = [
    { latitude: 39.85, longitude: 116.3 },
    { latitude: 39.85, longitude: 116.5 },
    { latitude: 39.95, longitude: 116.5 },
    { latitude: 39.95, longitude: 116.3 },
  ];

  const innerHole: LatLng[] = [
    { latitude: 39.88, longitude: 116.35 },
    { latitude: 39.88, longitude: 116.45 },
    { latitude: 39.92, longitude: 116.45 },
    { latitude: 39.92, longitude: 116.35 },
  ];

  const [polygons, setPolygons] = useState([
    {
      id: 1,
      coordinates: beijingArea,
      fillColor: 'rgba(255, 0, 0, 0.3)',
      strokeColor: '#FF0000',
      name: '北京区域',
    },
    {
      id: 2,
      coordinates: tiananmenSquare,
      fillColor: 'rgba(0, 255, 0, 0.5)',
      strokeColor: '#00FF00',
      name: '天安门广场',
    },
  ]);

  const [showHolePolygon, setShowHolePolygon] = useState(false);
  const [showDashedPolygon, setShowDashedPolygon] = useState(false);

  const handlePolygonPress = (name: string) => {
    Alert.alert('多边形点击', `您点击了: ${name}`);
  };

  const addRandomPolygon = () => {
    const center = { latitude: 39.915, longitude: 116.404 };
    const radius = 0.05;
    const sides = Math.floor(Math.random() * 5) + 3; // 3-7边形
    
    const newCoordinates = [];
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI * i) / sides;
      const lat = center.latitude + radius * Math.cos(angle);
      const lng = center.longitude + radius * Math.sin(angle);
      newCoordinates.push({ latitude: lat, longitude: lng });
    }

    const colors = ['rgba(255, 0, 0, 0.3)', 'rgba(0, 255, 0, 0.3)', 'rgba(0, 0, 255, 0.3)', 'rgba(255, 255, 0, 0.3)'];
    const strokeColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
    const colorIndex = Math.floor(Math.random() * colors.length);

    setPolygons(prev => [...prev, {
      id: Date.now(),
      coordinates: newCoordinates,
      fillColor: colors[colorIndex],
      strokeColor: strokeColors[colorIndex],
      name: `${sides}边形 ${prev.length + 1}`,
    }]);
  };

  const clearPolygons = () => {
    setPolygons([]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={{ latitude: 39.915, longitude: 116.404 }}
        zoom={10}
      >
        {/* 普通多边形 */}
        {polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            coordinates={polygon.coordinates}
            fillColor={polygon.fillColor}
            strokeColor={polygon.strokeColor}
            strokeWidth={2}
            onPress={() => handlePolygonPress(polygon.name)}
          />
        ))}

        {/* 带洞的多边形 */}
        {showHolePolygon && (
          <Polygon
            coordinates={outerRing}
            holes={[innerHole]}
            fillColor="rgba(255, 0, 255, 0.4)"
            strokeColor="#FF00FF"
            strokeWidth={3}
          />
        )}

        {/* 虚线边框多边形 */}
        {showDashedPolygon && (
          <Polygon
            coordinates={[
              { latitude: 39.85, longitude: 116.55 },
              { latitude: 39.85, longitude: 116.65 },
              { latitude: 39.95, longitude: 116.65 },
              { latitude: 39.95, longitude: 116.55 },
            ]}
            fillColor="rgba(0, 255, 255, 0.3)"
            strokeColor="#00FFFF"
            strokeWidth={3}
            dashed={true}
            dashPattern={[15, 10]}
          />
        )}
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={addRandomPolygon}>
          <Text style={styles.buttonText}>添加多边形</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, showHolePolygon && styles.activeButton]} 
          onPress={() => setShowHolePolygon(!showHolePolygon)}
        >
          <Text style={styles.buttonText}>带洞</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, showDashedPolygon && styles.activeButton]} 
          onPress={() => setShowDashedPolygon(!showDashedPolygon)}
        >
          <Text style={styles.buttonText}>虚线</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearPolygons}>
          <Text style={styles.buttonText}>清空</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>多边形数量: {polygons.length}</Text>
        <Text style={styles.infoText}>点击多边形查看详情</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  info: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default PolygonExample;
```

## 行政区域绘制示例

```typescript
import React, { useState, useEffect } from 'react';

const AdminAreaExample = () => {
  const [beijingDistricts, setBeijingDistricts] = useState([]);

  // 模拟加载行政区域数据
  useEffect(() => {
    const loadDistrictData = async () => {
      // 这里应该从API或本地数据加载真实的行政区域边界
      const districts = [
        {
          name: '朝阳区',
          coordinates: [
            { latitude: 39.92, longitude: 116.43 },
            { latitude: 39.92, longitude: 116.53 },
            { latitude: 39.97, longitude: 116.53 },
            { latitude: 39.97, longitude: 116.43 },
          ],
          fillColor: 'rgba(255, 0, 0, 0.2)',
          strokeColor: '#FF0000',
        },
        {
          name: '海淀区',
          coordinates: [
            { latitude: 39.95, longitude: 116.25 },
            { latitude: 39.95, longitude: 116.35 },
            { latitude: 40.05, longitude: 116.35 },
            { latitude: 40.05, longitude: 116.25 },
          ],
          fillColor: 'rgba(0, 255, 0, 0.2)',
          strokeColor: '#00FF00',
        },
      ];
      
      setBeijingDistricts(districts);
    };

    loadDistrictData();
  }, []);

  return (
    <MapView style={styles.map}>
      {beijingDistricts.map((district, index) => (
        <Polygon
          key={index}
          coordinates={district.coordinates}
          fillColor={district.fillColor}
          strokeColor={district.strokeColor}
          strokeWidth={2}
          onPress={() => Alert.alert('行政区域', district.name)}
        />
      ))}
    </MapView>
  );
};
```

## 性能优化建议

1. **顶点数量**: 避免使用过多的顶点，可以使用算法简化多边形
2. **批量操作**: 批量添加/删除多边形而不是逐个操作
3. **可见性管理**: 不在视野内的多边形可以设置为不可见
4. **复杂度控制**: 避免绘制过于复杂的多边形，影响渲染性能

## 注意事项

1. **顶点顺序**: 顶点的顺序决定了多边形的形状，建议按顺时针或逆时针排列
2. **最小顶点数**: 至少需要3个顶点才能构成多边形
3. **自相交**: 避免创建自相交的多边形，可能导致渲染异常
4. **坐标系统**: 确保所有顶点使用相同的坐标系统
5. **洞的方向**: 多边形的洞应该与外环方向相反

## 相关组件

- [MapView](./MapView.md) - 地图视图组件
- [Marker](./Marker.md) - 标记组件
- [Polyline](./Polyline.md) - 折线覆盖物
- [InfoWindow](./InfoWindow.md) - 信息窗口组件