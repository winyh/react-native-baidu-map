# InfoWindow 组件

InfoWindow 组件用于在地图上显示信息窗口，通常与标记配合使用，为用户提供详细的位置信息。

## 导入

```typescript
import { InfoWindow } from '@react-native/winyh-baidu-map';
```

## 基础用法

```typescript
<MapView style={{ flex: 1 }}>
  <InfoWindow
    coordinate={{ latitude: 39.915, longitude: 116.404 }}
    visible={true}
    title="北京"
    description="中国首都"
  />
</MapView>
```

## Props

### coordinate
- **类型**: `LatLng`
- **必需**: 是
- **描述**: 信息窗口的显示位置

```typescript
interface LatLng {
  latitude: number;
  longitude: number;
}
```

### visible
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 信息窗口是否可见

### title
- **类型**: `string`
- **必需**: 否
- **描述**: 信息窗口的标题

### description
- **类型**: `string`
- **必需**: 否
- **描述**: 信息窗口的描述内容

### image
- **类型**: `ImageSourcePropType`
- **必需**: 否
- **描述**: 信息窗口中显示的图片

```typescript
// 使用本地图片
<InfoWindow
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  image={require('./assets/location-image.jpg')}
/>

// 使用网络图片
<InfoWindow
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  image={{ uri: 'https://example.com/image.jpg' }}
/>
```

### anchor
- **类型**: `{ x: number; y: number }`
- **必需**: 否
- **默认值**: `{ x: 0.5, y: 1.0 }`
- **描述**: 信息窗口的锚点，相对于窗口的位置

### offset
- **类型**: `{ x: number; y: number }`
- **必需**: 否
- **默认值**: `{ x: 0, y: 0 }`
- **描述**: 信息窗口相对于坐标点的偏移量（像素）

### zIndex
- **类型**: `number`
- **必需**: 否
- **默认值**: `0`
- **描述**: 信息窗口的层级，数值越大越在上层

### enableTap
- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否允许点击信息窗口

### customView
- **类型**: `ReactNode`
- **必需**: 否
- **描述**: 自定义信息窗口内容

```typescript
<InfoWindow
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  customView={
    <View style={styles.customInfoWindow}>
      <Text style={styles.title}>自定义标题</Text>
      <Text style={styles.content}>自定义内容</Text>
      <TouchableOpacity style={styles.button}>
        <Text>点击按钮</Text>
      </TouchableOpacity>
    </View>
  }
/>
```

## 事件回调

### onPress
- **类型**: `() => void`
- **描述**: 点击信息窗口时触发

```typescript
<InfoWindow
  coordinate={{ latitude: 39.915, longitude: 116.404 }}
  onPress={() => {
    console.log('信息窗口被点击');
  }}
/>
```

### onClose
- **类型**: `() => void`
- **描述**: 信息窗口关闭时触发

### onShow
- **类型**: `() => void`
- **描述**: 信息窗口显示时触发

## 完整示例

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { MapView, InfoWindow, Marker, LatLng } from '@react-native/winyh-baidu-map';

const InfoWindowExample = () => {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [showCustomWindow, setShowCustomWindow] = useState(false);

  const locations = [
    {
      id: 1,
      coordinate: { latitude: 39.915, longitude: 116.404 },
      title: '天安门广场',
      description: '中华人民共和国的象征，位于北京市中心',
      image: require('./assets/tiananmen.jpg'),
    },
    {
      id: 2,
      coordinate: { latitude: 39.925, longitude: 116.414 },
      title: '王府井大街',
      description: '北京著名的商业街，历史悠久',
      image: require('./assets/wangfujing.jpg'),
    },
    {
      id: 3,
      coordinate: { latitude: 39.935, longitude: 116.424 },
      title: '东直门',
      description: '北京重要的交通枢纽',
      image: require('./assets/dongzhimen.jpg'),
    },
  ];

  const handleMarkerPress = (location: typeof locations[0]) => {
    setSelectedLocation(location.coordinate);
    Alert.alert('位置信息', `您选择了: ${location.title}`);
  };

  const handleInfoWindowPress = (title: string) => {
    Alert.alert('信息窗口', `点击了 ${title} 的信息窗口`);
  };

  const CustomInfoWindow = ({ location }: { location: typeof locations[0] }) => (
    <View style={styles.customInfoWindow}>
      <Image source={location.image} style={styles.infoImage} />
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{location.title}</Text>
        <Text style={styles.infoDescription}>{location.description}</Text>
        <View style={styles.infoButtons}>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => Alert.alert('导航', `导航到${location.title}`)}
          >
            <Text style={styles.buttonText}>导航</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => Alert.alert('详情', `查看${location.title}详情`)}
          >
            <Text style={styles.buttonText}>详情</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={{ latitude: 39.925, longitude: 116.414 }}
        zoom={13}
        onMapClick={() => setSelectedLocation(null)}
      >
        {/* 标记 */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={location.coordinate}
            onPress={() => handleMarkerPress(location)}
          />
        ))}

        {/* 基础信息窗口 */}
        {locations.map((location) => (
          <InfoWindow
            key={`info-${location.id}`}
            coordinate={location.coordinate}
            visible={selectedLocation?.latitude === location.coordinate.latitude && 
                     selectedLocation?.longitude === location.coordinate.longitude}
            title={location.title}
            description={location.description}
            image={location.image}
            onPress={() => handleInfoWindowPress(location.title)}
            onClose={() => setSelectedLocation(null)}
          />
        ))}

        {/* 自定义信息窗口 */}
        {showCustomWindow && (
          <InfoWindow
            coordinate={{ latitude: 39.945, longitude: 116.434 }}
            visible={true}
            customView={<CustomInfoWindow location={locations[0]} />}
            onClose={() => setShowCustomWindow(false)}
          />
        )}

        {/* 带偏移的信息窗口 */}
        <InfoWindow
          coordinate={{ latitude: 39.905, longitude: 116.394 }}
          visible={true}
          title="偏移窗口"
          description="这个窗口有偏移量"
          offset={{ x: 50, y: -50 }}
          anchor={{ x: 0, y: 0 }}
        />
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setShowCustomWindow(!showCustomWindow)}
        >
          <Text style={styles.buttonText}>
            {showCustomWindow ? '隐藏' : '显示'}自定义窗口
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setSelectedLocation(null)}
        >
          <Text style={styles.buttonText}>关闭所有窗口</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>点击标记显示信息窗口</Text>
        <Text style={styles.infoText}>点击地图空白处关闭窗口</Text>
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
  customInfoWindow: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContent: {
    padding: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  infoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
});

export default InfoWindowExample;
```

## 动态信息窗口示例

```typescript
import React, { useState, useEffect } from 'react';

const DynamicInfoWindowExample = () => {
  const [currentInfo, setCurrentInfo] = useState(null);
  const [infoData, setInfoData] = useState({});

  // 模拟异步加载数据
  const loadLocationInfo = async (coordinate: LatLng) => {
    try {
      // 模拟API调用
      const response = await fetch(`/api/location-info?lat=${coordinate.latitude}&lng=${coordinate.longitude}`);
      const data = await response.json();
      
      setInfoData(prev => ({
        ...prev,
        [`${coordinate.latitude}-${coordinate.longitude}`]: data
      }));
    } catch (error) {
      console.error('加载位置信息失败:', error);
    }
  };

  const handleMapClick = (coordinate: LatLng) => {
    setCurrentInfo(coordinate);
    
    const key = `${coordinate.latitude}-${coordinate.longitude}`;
    if (!infoData[key]) {
      loadLocationInfo(coordinate);
    }
  };

  const renderInfoContent = () => {
    if (!currentInfo) return null;
    
    const key = `${currentInfo.latitude}-${currentInfo.longitude}`;
    const data = infoData[key];
    
    if (!data) {
      return (
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.dynamicInfo}>
        <Text style={styles.dynamicTitle}>{data.name}</Text>
        <Text style={styles.dynamicDescription}>{data.description}</Text>
        <Text style={styles.dynamicDetail}>地址: {data.address}</Text>
        <Text style={styles.dynamicDetail}>电话: {data.phone}</Text>
      </View>
    );
  };

  return (
    <MapView
      style={styles.map}
      onMapClick={handleMapClick}
    >
      {currentInfo && (
        <InfoWindow
          coordinate={currentInfo}
          visible={true}
          customView={renderInfoContent()}
          onClose={() => setCurrentInfo(null)}
        />
      )}
    </MapView>
  );
};
```

## 批量信息窗口管理

```typescript
import React, { useState } from 'react';

const BatchInfoWindowExample = () => {
  const [visibleWindows, setVisibleWindows] = useState<Set<number>>(new Set());
  
  const locations = [
    { id: 1, coordinate: { latitude: 39.915, longitude: 116.404 }, title: '位置1' },
    { id: 2, coordinate: { latitude: 39.925, longitude: 116.414 }, title: '位置2' },
    { id: 3, coordinate: { latitude: 39.935, longitude: 116.424 }, title: '位置3' },
  ];

  const toggleInfoWindow = (id: number) => {
    setVisibleWindows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const showAllWindows = () => {
    setVisibleWindows(new Set(locations.map(loc => loc.id)));
  };

  const hideAllWindows = () => {
    setVisibleWindows(new Set());
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {locations.map((location) => (
          <React.Fragment key={location.id}>
            <Marker
              coordinate={location.coordinate}
              onPress={() => toggleInfoWindow(location.id)}
            />
            <InfoWindow
              coordinate={location.coordinate}
              visible={visibleWindows.has(location.id)}
              title={location.title}
              description={`这是${location.title}的描述`}
              onClose={() => toggleInfoWindow(location.id)}
            />
          </React.Fragment>
        ))}
      </MapView>
      
      <View style={styles.batchControls}>
        <TouchableOpacity style={styles.batchButton} onPress={showAllWindows}>
          <Text style={styles.buttonText}>显示全部</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton} onPress={hideAllWindows}>
          <Text style={styles.buttonText}>隐藏全部</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

## 性能优化建议

1. **按需显示**: 只显示当前需要的信息窗口，避免同时显示过多窗口
2. **内容缓存**: 缓存已加载的信息内容，避免重复请求
3. **懒加载**: 延迟加载信息窗口的详细内容
4. **内存管理**: 及时清理不需要的信息窗口数据

## 注意事项

1. **单一显示**: 通常同时只显示一个信息窗口，避免界面混乱
2. **响应式设计**: 确保信息窗口在不同屏幕尺寸下都能正常显示
3. **交互反馈**: 提供清晰的打开/关闭交互反馈
4. **内容长度**: 避免信息窗口内容过长，影响用户体验
5. **层级管理**: 合理设置 zIndex，确保信息窗口显示在正确的层级

## 相关组件

- [MapView](./MapView.md) - 地图视图组件
- [Marker](./Marker.md) - 标记组件
- [Polyline](./Polyline.md) - 折线覆盖物
- [Polygon](./Polygon.md) - 多边形覆盖物