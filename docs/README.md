# React Native 百度地图 SDK

一个功能完整的 React Native 百度地图 SDK 封装，支持地图显示、定位、标记、覆盖物等核心功能。

## 特性

- 🗺️ **完整的地图功能** - 支持普通、卫星、混合地图类型
- 📍 **精准定位服务** - 支持单次定位和连续定位监听
- 📌 **丰富的标记系统** - 支持自定义标记、信息窗口、拖拽等
- 🎨 **多样的覆盖物** - 支持折线、多边形、圆形等覆盖物
- 🔄 **坐标系转换** - 支持 BD09、GCJ02、WGS84 坐标系转换
- ⚡ **性能优化** - 内置标记聚合、性能监控等优化功能
- 🛡️ **完善的错误处理** - 统一的错误处理和日志系统
- 📱 **跨平台支持** - 同时支持 Android 和 iOS 平台

## 安装

```bash
npm install @react-native/winyh-baidu-map
# 或
yarn add @react-native/winyh-baidu-map
```

### iOS 配置

1. 在 `ios/Podfile` 中添加：
```ruby
pod 'BaiduMapKit'
```

2. 运行 `cd ios && pod install`

3. 在 `Info.plist` 中添加位置权限：
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>此应用需要访问位置信息以提供地图服务</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>此应用需要访问位置信息以提供地图服务</string>
```

### Android 配置

1. 在 `android/app/src/main/AndroidManifest.xml` 中添加权限：
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

2. 在 `android/app/build.gradle` 中添加：
```gradle
android {
    ...
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
    }
}
```

## 快速开始

### 1. 初始化 SDK

```typescript
import { BaiduMapModule, LocationMode, CoordinateType } from '@react-native/winyh-baidu-map';

const initializeSDK = async () => {
  try {
    // 设置隐私政策同意
    await BaiduMapModule.setAgreePrivacy(true);
    
    // 初始化 SDK
    const result = await BaiduMapModule.initialize({
      apiKey: 'YOUR_API_KEY_HERE',
      enableLocation: true,
      locationMode: LocationMode.HIGH_ACCURACY,
      coordinateType: CoordinateType.BD09LL,
    });
    
    if (result.success) {
      console.log('SDK 初始化成功');
    } else {
      console.error('SDK 初始化失败:', result.error);
    }
  } catch (error) {
    console.error('初始化异常:', error);
  }
};
```

### 2. 显示地图

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapView, MapType } from '@react-native/winyh-baidu-map';

const MapExample = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={{ latitude: 39.915, longitude: 116.404 }}
        zoom={12}
        mapType={MapType.NORMAL}
        showsUserLocation={true}
        onMapLoaded={() => console.log('地图加载完成')}
      />
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
});
```

### 3. 添加标记

```typescript
import { Marker } from '@react-native/winyh-baidu-map';

<MapView style={styles.map}>
  <Marker
    coordinate={{ latitude: 39.915, longitude: 116.404 }}
    title="北京"
    description="中国首都"
    draggable={true}
    onDragEnd={(coordinate) => console.log('标记拖拽到:', coordinate)}
  />
</MapView>
```

### 4. 获取位置

```typescript
import { LocationModule, PermissionManager } from '@react-native/winyh-baidu-map';

const getCurrentLocation = async () => {
  try {
    // 确保有位置权限
    const hasPermission = await PermissionManager.ensureLocationPermission();
    if (!hasPermission) return;
    
    // 获取当前位置
    const location = await LocationModule.getCurrentLocation({
      enableHighAccuracy: true,
      timeout: 15000,
      needAddress: true,
    });
    
    console.log('当前位置:', location);
  } catch (error) {
    console.error('定位失败:', error);
  }
};
```

## API 文档

### 组件

- [MapView](./api/MapView.md) - 地图视图组件
- [Marker](./api/Marker.md) - 标记组件
- [Polyline](./api/Polyline.md) - 折线组件
- [Polygon](./api/Polygon.md) - 多边形组件
- [InfoWindow](./api/InfoWindow.md) - 信息窗口组件

### 模块

- [BaiduMapModule](./api/BaiduMapModule.md) - 百度地图核心模块
- [LocationModule](./api/LocationModule.md) - 定位服务模块

### 工具类

- [CoordinateConverter](./api/CoordinateConverter.md) - 坐标转换工具
- [PerformanceOptimizer](./api/PerformanceOptimizer.md) - 性能优化工具
- [Logger](./api/Logger.md) - 日志工具
- [PermissionManager](./api/PermissionManager.md) - 权限管理工具

## 示例

查看 [example](../example/) 目录获取完整的使用示例：

- [BasicMapExample](../example/BasicMapExample.tsx) - 基础地图显示
- [LocationExample](../example/LocationExample.tsx) - 定位功能演示
- [MarkersExample](../example/MarkersExample.tsx) - 标记和覆盖物
- [ComplexExample](../example/ComplexExample.tsx) - 复杂场景综合示例

## 常见问题

### Q: 地图不显示或显示空白？
A: 请检查：
1. API Key 是否正确配置
2. 网络连接是否正常
3. 是否正确初始化 SDK
4. 检查控制台是否有错误信息

### Q: 定位失败？
A: 请检查：
1. 是否已获取位置权限
2. 设备 GPS 是否开启
3. 网络连接是否正常
4. 是否在室内等信号较弱的环境

### Q: Android 编译失败？
A: 请检查：
1. 是否正确配置了 packagingOptions
2. 是否添加了必要的权限
3. 是否正确放置了 so 文件

### Q: iOS 编译失败？
A: 请检查：
1. 是否正确安装了 CocoaPods
2. 是否添加了位置权限描述
3. 是否正确配置了 Info.plist

## 版本更新

### v1.0.0
- 初始版本发布
- 支持基础地图显示
- 支持定位功能
- 支持标记和覆盖物
- 支持坐标转换

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

如果您在使用过程中遇到问题，可以：

1. 查看 [常见问题](#常见问题) 部分
2. 搜索或提交 [GitHub Issues](https://github.com/your-repo/issues)
3. 查看 [百度地图官方文档](https://lbsyun.baidu.com/)