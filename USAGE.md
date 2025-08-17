# 使用指南

本文档详细说明了如何在作为库引入时配置和使用百度地图。

## 安装

```bash
npm install @react-native/winyh-baidu-map
```

或

```bash
yarn add @react-native/winyh-baidu-map
```

## API Key 配置

### 获取 API Key

在使用百度地图之前，你需要从[百度地图开放平台](https://lbsyun.baidu.com/)获取 API Key：

1. 访问[百度地图开放平台控制台](https://console.lbsyun.baidu.com/)
2. 创建应用并获取 API Key
3. 配置应用的 SHA1 和包名（Android）或 Bundle ID（iOS）

### Android 平台配置

Android 平台支持多种 API Key 配置方式，你可以根据需要选择其中一种：

#### 1. 动态传入（推荐）

在初始化 SDK 时动态传入 API Key：

```typescript
import { BaiduMapModule } from '@react-native/winyh-baidu-map';

await BaiduMapModule.initialize({
  apiKey: 'YOUR_API_KEY_HERE',
  enableLocation: true,
});
```

#### 2. 通过 gradle.properties 配置

在你的项目 `android/gradle.properties` 文件中添加：

```properties
# 百度地图 API Key
baiduMapApiKey=YOUR_API_KEY_HERE
```

然后在你的应用 [AndroidManifest.xml](file:///Users/winyh/Desktop/hpc/baidu-map/android/src/main/AndroidManifest.xml) 中使用占位符：

```xml
<application>
    <!-- 百度地图API Key -->
    <meta-data
        android:name="com.baidu.lbsapi.API_KEY"
        android:value="${BAIDU_MAP_API_KEY}" />
</application>
```

#### 3. 直接在 AndroidManifest.xml 中配置

在你的应用 [AndroidManifest.xml](file:///Users/winyh/Desktop/hpc/baidu-map/android/src/main/AndroidManifest.xml) 中直接配置 API Key：

```xml
<application>
    <!-- 百度地图API Key -->
    <meta-data
        android:name="com.baidu.lbsapi.API_KEY"
        android:value="YOUR_API_KEY_HERE" />
</application>
```

### iOS 平台配置

iOS 平台目前只支持动态传入 API Key 的方式：

```typescript
import { BaiduMapModule } from '@react-native/winyh-baidu-map';

await BaiduMapModule.initialize({
  apiKey: 'YOUR_API_KEY_HERE',
  enableLocation: true,
});
```

## 初始化 SDK

在使用地图功能之前，必须先初始化 SDK：

```typescript
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { BaiduMapModule, LocationMode, CoordinateType } from '@react-native/winyh-baidu-map';

const initializeSDK = async () => {
  try {
    // 同意隐私政策（必须）
    await BaiduMapModule.setAgreePrivacy(true);
    
    // 初始化 SDK
    const result = await BaiduMapModule.initialize({
      apiKey: 'YOUR_API_KEY_HERE',
      enableLocation: true,
      locationMode: LocationMode.HIGH_ACCURACY,
      coordinateType: CoordinateType.BD09LL,
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

  // ... 你的应用代码
};

export default App;
```

## 基本用法

### 显示地图

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapView } from '@react-native/winyh-baidu-map';

const BasicMap = () => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={{ latitude: 39.915, longitude: 116.404 }}
        zoom={12}
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

export default BasicMap;
```

### 添加标记

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapView, Marker } from '@react-native/winyh-baidu-map';

const MapWithMarker = () => {
  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        <Marker
          coordinate={{ latitude: 39.915, longitude: 116.404 }}
          title="天安门广场"
          description="北京市中心"
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
});

export default MapWithMarker;
```

## 高级功能

### 定位功能

```typescript
import { LocationModule } from '@react-native/winyh-baidu-map';

// 获取当前位置
const getCurrentLocation = async () => {
  try {
    const location = await LocationModule.getCurrentLocation({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    console.log('当前位置:', location);
  } catch (error) {
    console.error('获取位置失败:', error);
  }
};

// 开始连续定位
const startLocationService = () => {
  LocationModule.startLocationService({
    interval: 5000, // 5秒定位一次
    needAddress: true,
  });
};

// 监听位置更新
LocationModule.addEventListener('locationUpdate', (location) => {
  console.log('位置更新:', location);
});
```

### 地理编码

```typescript
import { GeocodingModule } from '@react-native/winyh-baidu-map';

// 地址转坐标
const geocode = async () => {
  try {
    const result = await GeocodingModule.geocode('北京市天安门广场');
    console.log('地理编码结果:', result);
  } catch (error) {
    console.error('地理编码失败:', error);
  }
};

// 坐标转地址
const reverseGeocode = async () => {
  try {
    const result = await GeocodingModule.reverseGeocode({
      latitude: 39.915,
      longitude: 116.404,
    });
    console.log('逆地理编码结果:', result);
  } catch (error) {
    console.error('逆地理编码失败:', error);
  }
};
```

## 注意事项

1. **隐私政策**：在初始化 SDK 前必须调用 `setAgreePrivacy(true)` 方法同意隐私政策
2. **权限申请**：Android 平台需要定位权限，iOS 平台需要位置权限
3. **API Key 安全**：不要将 API Key 硬编码在代码中，建议使用环境变量或配置文件管理
4. **包名/Bundle ID**：确保在百度地图开放平台配置的包名/Bundle ID 与你的应用一致

## 故障排除

### SDK 初始化失败

1. 检查 API Key 是否正确
2. 确认 API Key 是否已在百度地图开放平台配置了正确的包名/Bundle ID
3. 确认是否已调用 `setAgreePrivacy(true)` 方法

### 地图不显示

1. 检查网络连接
2. 确认 API Key 是否有地图服务权限
3. 检查是否正确配置了混淆规则（如果开启了代码混淆）

### 定位功能异常

1. 检查定位权限是否已授予
2. 确认设备定位服务是否已开启
3. 检查 API Key 是否有定位服务权限