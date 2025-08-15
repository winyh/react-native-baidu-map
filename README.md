# @react-native/winyh-baidu-map

React Native 百度地图库，支持 Android 平台的地图显示和定位功能。

## 特性

- ✅ 支持 React Native 0.60+ 自动链接
- ✅ 兼容 AndroidX
- ✅ 完整的 TypeScript 支持
- ✅ 地图显示和交互
- ✅ 定位服务
- ✅ 标记和覆盖物
- ✅ 权限管理

## 安装

```bash
npm install @react-native/winyh-baidu-map
# 或
yarn add @react-native/winyh-baidu-map
```

### Android 配置

1. 在百度开放平台申请 API Key
2. 在 `android/app/src/main/AndroidManifest.xml` 中添加：

```xml
<meta-data
    android:name="com.baidu.lbsapi.API_KEY"
    android:value="你的百度地图API_KEY" />
```

## 使用示例

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapView, Marker } from '@react-native/winyh-baidu-map';

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        center={{ latitude: 39.915, longitude: 116.404 }}
        zoom={12}
        onMapReady={() => console.log('地图加载完成')}
      >
        <Marker
          coordinate={{ latitude: 39.915, longitude: 116.404 }}
          title="北京"
          description="中国首都"
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

## API 文档

详细的 API 文档请查看 [docs](./docs) 目录。

## 参考示例
baidu 文件夹包含百度地图官方 sdk 和 demo 


## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request。