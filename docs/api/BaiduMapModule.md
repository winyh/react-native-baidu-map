# BaiduMapModule 模块

BaiduMapModule 是百度地图SDK的核心模块，负责SDK的初始化、配置和基础功能管理。

## 导入

```typescript
import { BaiduMapModule } from '@react-native/winyh-baidu-map';
```

## 方法

### setAgreePrivacy
设置隐私政策同意状态

```typescript
static async setAgreePrivacy(agree: boolean): Promise<void>
```

**参数**:
- `agree`: 是否同意隐私政策

**示例**:
```typescript
await BaiduMapModule.setAgreePrivacy(true);
```

### initialize
初始化百度地图SDK

```typescript
static async initialize(config: BaiduMapConfig): Promise<InitializeResult>
```

**参数**:
- `config`: SDK初始化配置

```typescript
interface BaiduMapConfig {
  apiKey: string;                    // 百度地图API密钥
  enableLocation?: boolean;          // 是否启用定位功能
  locationMode?: LocationMode;       // 定位模式
  coordinateType?: CoordinateType;   // 坐标系类型
  enableHttps?: boolean;            // 是否启用HTTPS
  enableDebug?: boolean;            // 是否启用调试模式
}

interface InitializeResult {
  success: boolean;
  error?: {
    code: number;
    message: string;
  };
}
```

**示例**:
```typescript
const result = await BaiduMapModule.initialize({
  apiKey: 'YOUR_API_KEY_HERE',
  enableLocation: true,
  locationMode: LocationMode.HIGH_ACCURACY,
  coordinateType: CoordinateType.BD09LL,
  enableHttps: true,
  enableDebug: __DEV__,
});

if (result.success) {
  console.log('SDK初始化成功');
} else {
  console.error('SDK初始化失败:', result.error);
}
```

### getVersion
获取SDK版本信息

```typescript
static async getVersion(): Promise<string>
```

**返回值**: SDK版本号字符串

**示例**:
```typescript
const version = await BaiduMapModule.getVersion();
console.log('百度地图SDK版本:', version);
```

### isInitialized
检查SDK是否已初始化

```typescript
static async isInitialized(): Promise<boolean>
```

**返回值**: 是否已初始化

**示例**:
```typescript
const initialized = await BaiduMapModule.isInitialized();
if (!initialized) {
  await BaiduMapModule.initialize(config);
}
```

### setLogLevel
设置日志级别

```typescript
static async setLogLevel(level: LogLevel): Promise<void>
```

**参数**:
- `level`: 日志级别

```typescript
enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  NONE = 5,
}
```

**示例**:
```typescript
await BaiduMapModule.setLogLevel(LogLevel.DEBUG);
```

### clearCache
清除地图缓存

```typescript
static async clearCache(): Promise<void>
```

**示例**:
```typescript
await BaiduMapModule.clearCache();
```

### setUserAgent
设置用户代理

```typescript
static async setUserAgent(userAgent: string): Promise<void>
```

**参数**:
- `userAgent`: 用户代理字符串

**示例**:
```typescript
await BaiduMapModule.setUserAgent('MyApp/1.0.0');
```

## 完整示例

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { 
  BaiduMapModule, 
  LocationMode, 
  CoordinateType, 
  LogLevel 
} from '@react-native/winyh-baidu-map';

const BaiduMapInitializer = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sdkVersion, setSdkVersion] = useState('');
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeBaiduMap();
  }, []);

  const initializeBaiduMap = async () => {
    try {
      // 1. 设置隐私政策同意
      await BaiduMapModule.setAgreePrivacy(true);
      
      // 2. 设置日志级别
      await BaiduMapModule.setLogLevel(__DEV__ ? LogLevel.DEBUG : LogLevel.ERROR);
      
      // 3. 设置用户代理
      await BaiduMapModule.setUserAgent('MyBaiduMapApp/1.0.0');
      
      // 4. 检查是否已初始化
      const alreadyInitialized = await BaiduMapModule.isInitialized();
      if (alreadyInitialized) {
        setIsInitialized(true);
        const version = await BaiduMapModule.getVersion();
        setSdkVersion(version);
        return;
      }
      
      // 5. 初始化SDK
      const result = await BaiduMapModule.initialize({
        apiKey: 'YOUR_API_KEY_HERE', // 替换为您的API密钥
        enableLocation: true,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
        enableHttps: true,
        enableDebug: __DEV__,
      });
      
      if (result.success) {
        setIsInitialized(true);
        const version = await BaiduMapModule.getVersion();
        setSdkVersion(version);
        console.log('百度地图SDK初始化成功');
      } else {
        setInitError(result.error?.message || '初始化失败');
        console.error('百度地图SDK初始化失败:', result.error);
        Alert.alert('初始化失败', result.error?.message || '未知错误');
      }
    } catch (error) {
      setInitError(error.message || '初始化异常');
      console.error('百度地图SDK初始化异常:', error);
      Alert.alert('初始化异常', error.message || '未知异常');
    }
  };

  const handleClearCache = async () => {
    try {
      await BaiduMapModule.clearCache();
      Alert.alert('成功', '地图缓存已清除');
    } catch (error) {
      Alert.alert('错误', '清除缓存失败');
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>正在初始化百度地图SDK...</Text>
        {initError && (
          <Text style={styles.error}>初始化失败: {initError}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>百度地图SDK已就绪</Text>
      <Text style={styles.version}>SDK版本: {sdkVersion}</Text>
      <TouchableOpacity style={styles.button} onPress={handleClearCache}>
        <Text style={styles.buttonText}>清除缓存</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  error: {
    fontSize: 14,
    color: '#FF0000',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default BaiduMapInitializer;
```

## 错误处理

### 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 101 | API密钥无效 | 检查API密钥是否正确 |
| 102 | 网络连接失败 | 检查网络连接 |
| 103 | 权限不足 | 检查应用权限配置 |
| 104 | SDK版本不兼容 | 更新SDK版本 |

### 错误处理示例

```typescript
const handleInitializeError = (error: any) => {
  switch (error.code) {
    case 101:
      Alert.alert('API密钥错误', '请检查您的百度地图API密钥是否正确');
      break;
    case 102:
      Alert.alert('网络错误', '请检查网络连接后重试');
      break;
    case 103:
      Alert.alert('权限错误', '请检查应用权限配置');
      break;
    default:
      Alert.alert('初始化失败', error.message || '未知错误');
  }
};
```

## 最佳实践

### 1. 初始化时机
```typescript
// 在App组件的最顶层进行初始化
const App = () => {
  useEffect(() => {
    const initSDK = async () => {
      await BaiduMapModule.setAgreePrivacy(true);
      await BaiduMapModule.initialize(config);
    };
    initSDK();
  }, []);
  
  return <YourAppContent />;
};
```

### 2. 配置管理
```typescript
// 创建配置文件
const baiduMapConfig = {
  development: {
    apiKey: 'DEV_API_KEY',
    enableDebug: true,
    logLevel: LogLevel.DEBUG,
  },
  production: {
    apiKey: 'PROD_API_KEY',
    enableDebug: false,
    logLevel: LogLevel.ERROR,
  },
};

const config = __DEV__ ? baiduMapConfig.development : baiduMapConfig.production;
```

### 3. 错误监控
```typescript
const initializeWithMonitoring = async () => {
  try {
    const result = await BaiduMapModule.initialize(config);
    if (!result.success) {
      // 上报错误到监控系统
      crashlytics().recordError(new Error(`BaiduMap init failed: ${result.error?.message}`));
    }
  } catch (error) {
    crashlytics().recordError(error);
  }
};
```

## 注意事项

1. **API密钥**: 确保使用正确的百度地图API密钥
2. **隐私政策**: 必须在初始化前调用 `setAgreePrivacy(true)`
3. **初始化顺序**: 按照正确的顺序进行初始化
4. **错误处理**: 妥善处理初始化失败的情况
5. **缓存管理**: 定期清理地图缓存以释放存储空间

## 相关模块

- [LocationModule](./LocationModule.md) - 定位服务模块
- [CoordinateConverter](./CoordinateConverter.md) - 坐标转换工具
- [Logger](./Logger.md) - 日志工具