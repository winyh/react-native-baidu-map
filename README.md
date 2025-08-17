# React Native Baidu Map

[![npm version](https://img.shields.io/npm/v/@react-native/winyh-baidu-map.svg?style=flat-square)](https://www.npmjs.com/package/@react-native/winyh-baidu-map)
[![license](https://img.shields.io/npm/l/@react-native/winyh-baidu-map.svg?style=flat-square)](./LICENSE)

一个功能丰富的 React Native 百度地图库，同时支持 Android 和 iOS 平台，提供一致的开发体验。

## 🌐 在线文档

查看我们的 [GitHub Pages 在线文档](https://winyh.github.io/react-native-baidu-map) 了解完整功能和使用方法。

## ✨ 功能亮点

- **统一的 API**: 在 Android 和 iOS 上提供一致的组件和接口。
- **地图交互**: 支持缩放、平移、旋转、俯视等所有基本手势。
- **覆盖物组件**: 提供 `<Marker />`, `<Polyline />`, `<Polygon />`, `<InfoWindow />` 等丰富的地图覆盖物组件。
- **定位服务**: 内置强大的定位模块，支持单次定位和连续定位。
- **地理编码**: 提供地址与坐标相互转换、POI 搜索、周边搜索等功能。
- **路线规划**: 支持驾车、步行、骑行、公交等多种出行方式的路线规划。
- **TypeScript 支持**: 提供完整的类型定义，提升开发体验和代码健壮性。
- **自动链接**: 支持 React Native 0.60+ 的自动链接，无需手动修改原生项目配置。

## 🔧 安装与配置

### 1. 安装依赖

```bash
npm install @react-native/winyh-baidu-map
```

### 2. iOS 配置

#### a. 安装原生依赖

```bash
cd ios && pod install
```

#### b. 配置权限

在您的 `ios/YourProjectName/Info.plist` 文件中，添加以下权限描述，以便应用可以访问用户位置：

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>我们需要您的位置信息来提供地图和定位服务。</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>我们需要您的位置信息来提供地图和定位服务。</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>我们需要您的位置信息来提供地图和定位服务。</string>
```

#### c. 配置 API Key

在 `ios/YourProjectName/Info.plist` 中添加您的百度地图 API Key：

```xml
<key>BaiduMapAPI_Key</key>
<string>YOUR_IOS_API_KEY</string>
```

### 3. Android 配置

#### a. 配置权限

在您的 `android/app/src/main/AndroidManifest.xml` 文件中，确保以下权限已添加：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### b. 配置 API Key

推荐在 `android/app/src/main/AndroidManifest.xml` 的 `<application>` 标签内添加您的 API Key：

```xml
<application ...>
  ...
  <meta-data
      android:name="com.baidu.lbsapi.API_KEY"
      android:value="YOUR_ANDROID_API_KEY" />
  ...
</application>
```
这样做之后，您在初始化 SDK 时就无需再次传入 `apiKey`。

## 🚀 快速上手

在使用地图前，您必须先同意隐私政策并初始化 SDK。

```tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import {
  BaiduMapModule,
  MapView,
  Marker,
} from '@react-native/winyh-baidu-map';

// 在应用启动时进行初始化
const initializeSDK = async () => {
  try {
    // 1. 同意隐私政策 (必须)
    await BaiduMapModule.setAgreePrivacy(true);
    
    // 2. 初始化 SDK
    // 如果您已在 AndroidManifest.xml 中配置了 API Key，则无需传入
    await BaiduMapModule.initialize({
      apiKey: 'YOUR_ANDROID_API_KEY_IF_NOT_IN_MANIFEST',
    });

    console.log('Baidu Map SDK initialized successfully.');

  } catch (error) {
    Alert.alert('初始化异常', error.message);
  }
};

initializeSDK();

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={{ latitude: 39.915, longitude: 116.404 }} // 地图中心点：北京
        zoom={15} // 缩放级别
        showsUserLocation={true} // 显示用户位置
        onMapLoaded={() => console.log('地图加载完成')}
      >
        <Marker
          coordinate={{ latitude: 39.915, longitude: 116.404 }}
          title="天安门广场"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
```

## 📚 API 文档

想了解所有组件的 Props 和模块的详细方法吗？请查阅我们的 **[API 详细文档](./docs/api/)**。

- [**MapView**](./docs/api/MapView.md): 地图视图组件。
- [**Marker**](./docs/api/Marker.md): 地图标记点。
- [**LocationModule**](./docs/api/LocationModule.md): 定位功能模块。
- [**GeocodingModule**](./docs/api/GeocodingModule.md): 地理编码模块。
- [**RoutePlanningModule**](./docs/api/RoutePlanningModule.md): 路径规划模块。
- ...以及更多！

## 🤝 如何贡献

我们欢迎任何形式的贡献！如果您想帮助改进这个项目，请查阅 **[贡献指南](./CONTRIBUTING.md)**，其中包含了如何设置本地环境、运行测试和发布新版本的详细说明。

## 📫 联系方式

如果您有任何问题、建议或商业合作意向，请通过以下方式联系我：

- **邮箱**: <2712192471@qq.com>

## 📄 许可证

本项目采用双重许可（Dual-license）模式。

- **开源使用**: 对于开源项目，您可以在 **[GNU General Public License v3.0 (GPLv3)](./LICENSE)** 的条款下免费使用、修改和分发本软件。

- **商业使用**: 如果您希望在闭源的商业产品中使用此库，或无法遵守 GPLv3 的条款，则必须购买商业许可。请通过邮箱 <2712192471@qq.com> 联系作者以获取商业许可。
