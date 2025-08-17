# React Native Baidu Map

[![npm version](https://img.shields.io/npm/v/@react-native/winyh-baidu-map.svg?style=flat-square)](https://www.npmjs.com/package/@react-native/winyh-baidu-map)
[![license](https://img.shields.io/npm/l/@react-native/winyh-baidu-map.svg?style=flat-square)](./LICENSE)

一个功能丰富的 React Native 百度地图库，同时支持 Android 和 iOS 平台，提供一致的开发体验。

## ✨ 功能亮点

- **统一的 API**: 在 Android 和 iOS 上提供一致的组件和接口。
- **地图交互**: 支持缩放、平移、旋转、俯视等所有基本手势。
- **覆盖物组件**: 提供 `<Marker />`, `<Polyline />`, `<Polygon />`, `<InfoWindow />` 等丰富的地图覆盖物组件。
- **定位服务**: 内置强大的定位模块，支持单次定位和连续定位。
- **地理编码**: 提供地址与坐标相互转换、POI 搜索、周边搜索等功能。
- **路线规划**: 支持驾车、步行、骑行、公交等多种出行方式的路线规划。
- **TypeScript 支持**: 提供完整的类型定义，提升开发体验和代码健壮性。
- **自动链接**: 支持 React Native 0.60+ 的自动链接，无需手动修改原生项目配置。

## 🔧 安装

```bash
npm install @react-native/winyh-baidu-map
```

## 📚 使用文档

- [详细使用指南](./USAGE.md) - 包含 API Key 配置、初始化和各种功能的使用方法
- [API 参考](./docs/api.md) - 完整的 API 文档

### iOS 配置

```bash
cd ios && pod install
```

### Android 配置

从版本 1.0.0 开始，Android 端支持统一的 API Key 配置方式。您可以通过以下任一方式配置：

#### 方式一：在 gradle.properties 中配置（推荐）

在您的项目根目录下的 `android/gradle.properties` 文件中添加：

```properties
# 百度地图 API Key
baiduMapApiKey=YOUR_API_KEY_HERE
```

#### 方式二：在 local.properties 中配置

在您的项目根目录下的 `android/local.properties` 文件中添加：

```properties
# 百度地图 API Key
baiduMapApiKey=YOUR_API_KEY_HERE
```

#### 方式三：在 AndroidManifest.xml 中直接配置

在您的应用项目中的 [AndroidManifest.xml](file:///Users/winyh/Desktop/hpc/baidu-map/android/src/main/AndroidManifest.xml) 文件中添加：

```xml
<application>
    <!-- 百度地图API Key -->
    <meta-data
        android:name="com.baidu.lbsapi.API_KEY"
        android:value="YOUR_API_KEY_HERE" />
</application>
```

#### 方式四：在初始化时动态传入

您也可以在初始化 SDK 时动态传入 API Key：

```typescript
import { BaiduMapModule } from '@react-native/winyh-baidu-map';

// 初始化 SDK 时传入 API Key
await BaiduMapModule.initialize({
  apiKey: 'YOUR_API_KEY_HERE',
  // 其他配置...
});
```

## 🚀 快速上手

在使用地图前，您必须先同意隐私政策并使用从百度地图开放平台申请的 AppKey 初始化 SDK。

```tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import {
  BaiduMapModule,
  MapView,
  Marker,
  LocationModule,
} from '@react-native/winyh-baidu-map';

// 在应用启动时进行初始化
const initializeSDK = async () => {
  try {
    // 同意隐私政策
    await BaiduMapModule.setAgreePrivacy(true);
    
    // 初始化 SDK
    const result = await BaiduMapModule.initialize({
      apiKey: 'YOUR_API_KEY_HERE', // 请替换为您自己的 API Key
      enableLocation: true,
    });
    
    if (!result.success) {
      Alert.alert('初始化失败', result.error?.message);
    }
  } catch (error) {
    Alert.alert('初始化异常', error.message);
  }
};

const App = () => {
  useEffect(() => {
    initializeSDK();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
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

export default App;
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
