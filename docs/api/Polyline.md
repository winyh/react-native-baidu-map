# Polyline 组件

Polyline 组件用于在地图上绘制折线，常用于显示路径、轨迹等线性数据。

## 导入

```typescript
import { Polyline } from '@react-native/winyh-baidu-map';
```

## 基础用法

```typescript
<MapView style={{ flex: 1 }}>
  <Polyline
    coordinates={[
      { latitude: 39.915, longitude: 116.404 },
      { latitude: 39.925, longitude: 116.414 },
      { latitude: 39.935, longitude: 116.424 },
    ]}
    color="#FF0000"
    width={3}
  />
</MapView>
```

## Props

### coordinates
- **类型**: `LatLng[]`
- **必需**: 是
- **描述**: 折线的坐标点数组，至少需要2个点

```typescript
interface LatLng {
  latitude: number;
  longitude: number;
}

// 示例
const coordinates = [
  { latitude: 39.915, longitude: 116.404 },
  { latitude: 39.925, longitude: 116.414 },
  { latitude: 39.935, longitude: 116.424 },
];
```

### color
- **类型**: `string`
- **必需**: 否
- **默认值**: `"#000000"`
- **描述**: 折线颜色，支持十六进制颜色值

```typescript
// 不同颜色示例
<Polyline coordinates={coordinates} color="#FF0000" /> // 红色
<Polyline coordinates={coordinates} color="#00FF00" /> // 绿色
<Polyline coordinates={coordinates} color="#0000FF" /> // 蓝色
<Polyline coordinates={coordinates} color="rgba(255, 0, 0, 0.5)" /> // 半透明红色
```

### width
- **类型**: `number`
- **必需**: 否
- **默认值**: `1`
- **描述**: 折线宽度（像素）

### visible
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 折线是否可见

### zIndex
- **类型**: `number`
- **必需**: 否
- **默认值**: `0`
- **描述**: 折线的层级，数值越大越在上层

### geodesic
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 是否绘制大圆弧线（地球表面最短路径）

### dashed
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `false`
- **描述**: 是否绘制虚线

### dashPattern
- **类型**: `number[]`
- **必需**: 否
- **描述**: 虚线模式，数组表示实线和空白的长度

```typescript
// 虚线示例
<Polyline
  coordinates={coordinates}
  dashed={true}
  dashPattern={[10, 5]} // 10像素实线，5像素空白
  color="#FF0000"
  width={3}
/>
```

### lineCap
- **类型**: `'butt' | 'round' | 'square'`
- **必需**: 否
- **默认值**: `'round'`
- **描述**: 线条端点样式

### lineJoin
- **类型**: `'miter' | 'round' | 'bevel'`
- **必需**: 否
- **默认值**: `'round'`
- **描述**: 线条连接点样式

## 事件回调

### onPress
- **类型**: `() => void`
- **描述**: 点击折线时触发

```typescript
<Polyline
  coordinates={coordinates}
  onPress={() => {
    console.log('折线被点击');
  }}
/>
```

## 完整示例

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { MapView, Polyline, LatLng } from '@react-native/winyh-baidu-map';

const PolylineExample = () => {
  // 北京市内的一条路径
  const beijingRoute: LatLng[] = [
    { latitude: 39.915, longitude: 116.404 }, // 天安门
    { latitude: 39.925, longitude: 116.414 }, // 王府井
    { latitude: 39.935, longitude: 116.424 }, // 东直门
    { latitude: 39.945, longitude: 116.434 }, // 三里屯
    { latitude: 39.955, longitude: 116.444 }, // 朝阳公园
  ];

  // 上海市内的一条路径
  const shanghaiRoute: LatLng[] = [
    { latitude: 31.235, longitude: 121.505 }, // 外滩
    { latitude: 31.245, longitude: 121.515 }, // 南京路
    { latitude: 31.255, longitude: 121.525 }, // 人民广场
    { latitude: 31.265, longitude: 121.535 }, // 静安寺
  ];

  const [routes, setRoutes] = useState([
    {
      id: 1,
      coordinates: beijingRoute,
      color: '#FF0000',
      width: 4,
      name: '北京路线',
    },
    {
      id: 2,
      coordinates: shanghaiRoute,
      color: '#00FF00',
      width: 3,
      name: '上海路线',
    },
  ]);

  const [showDashedLine, setShowDashedLine] = useState(false);

  const handleRoutePress = (routeName: string) => {
    Alert.alert('路线点击', `您点击了: ${routeName}`);
  };

  const addRandomRoute = () => {
    const center = { latitude: 39.915, longitude: 116.404 };
    const newRoute = [];
    
    // 生成随机路径
    for (let i = 0; i < 5; i++) {
      newRoute.push({
        latitude: center.latitude + (Math.random() - 0.5) * 0.1,
        longitude: center.longitude + (Math.random() - 0.5) * 0.1,
      });
    }

    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setRoutes(prev => [...prev, {
      id: Date.now(),
      coordinates: newRoute,
      color: randomColor,
      width: Math.floor(Math.random() * 5) + 2,
      name: `随机路线 ${prev.length + 1}`,
    }]);
  };

  const clearRoutes = () => {
    setRoutes([]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={{ latitude: 39.915, longitude: 116.404 }}
        zoom={11}
      >
        {/* 普通折线 */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            color={route.color}
            width={route.width}
            onPress={() => handleRoutePress(route.name)}
          />
        ))}

        {/* 虚线示例 */}
        {showDashedLine && (
          <Polyline
            coordinates={[
              { latitude: 39.905, longitude: 116.394 },
              { latitude: 39.965, longitude: 116.454 },
            ]}
            color="#FF00FF"
            width={4}
            dashed={true}
            dashPattern={[15, 10]}
            lineCap="round"
          />
        )}

        {/* 大圆弧线示例 */}
        <Polyline
          coordinates={[
            { latitude: 39.915, longitude: 116.404 },
            { latitude: 31.235, longitude: 121.505 }, // 北京到上海
          ]}
          color="#0000FF"
          width={2}
          geodesic={true}
        />
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={addRandomRoute}>
          <Text style={styles.buttonText}>添加路线</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, showDashedLine && styles.activeButton]} 
          onPress={() => setShowDashedLine(!showDashedLine)}
        >
          <Text style={styles.buttonText}>虚线</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearRoutes}>
          <Text style={styles.buttonText}>清空</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>路线数量: {routes.length}</Text>
        <Text style={styles.infoText}>点击路线查看详情</Text>
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
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

export default PolylineExample;
```

## 动态路径绘制

```typescript
import React, { useState, useEffect } from 'react';

const AnimatedPolylineExample = () => {
  const fullRoute: LatLng[] = [
    { latitude: 39.915, longitude: 116.404 },
    { latitude: 39.925, longitude: 116.414 },
    { latitude: 39.935, longitude: 116.424 },
    { latitude: 39.945, longitude: 116.434 },
    { latitude: 39.955, longitude: 116.444 },
  ];

  const [currentRoute, setCurrentRoute] = useState<LatLng[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateRoute = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentRoute([]);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullRoute.length) {
        setCurrentRoute(prev => [...prev, fullRoute[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {currentRoute.length > 1 && (
          <Polyline
            coordinates={currentRoute}
            color="#FF0000"
            width={4}
          />
        )}
      </MapView>
      
      <TouchableOpacity 
        style={[styles.animateButton, isAnimating && styles.disabledButton]} 
        onPress={animateRoute}
        disabled={isAnimating}
      >
        <Text style={styles.buttonText}>
          {isAnimating ? '绘制中...' : '开始动画'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 性能优化建议

1. **坐标点数量**: 避免使用过多的坐标点，可以使用算法简化路径
2. **批量更新**: 批量更新坐标而不是逐个添加
3. **可见性管理**: 不在视野内的折线可以设置为不可见
4. **内存管理**: 及时清理不需要的折线数据

## 注意事项

1. **坐标顺序**: 坐标点的顺序决定了折线的绘制方向
2. **最小点数**: 至少需要2个坐标点才能绘制折线
3. **性能影响**: 复杂的折线（特别是虚线）可能影响地图性能
4. **坐标系统**: 确保所有坐标点使用相同的坐标系统

## 相关组件

- [MapView](./MapView.md) - 地图视图组件
- [Marker](./Marker.md) - 标记组件
- [Polygon](./Polygon.md) - 多边形覆盖物
- [InfoWindow](./InfoWindow.md) - 信息窗口组件