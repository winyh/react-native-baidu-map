# 路径规划 API 文档

百度地图 React Native SDK 提供了完整的路径规划和导航功能，支持驾车、步行、公交、骑行等多种出行方式。

## 导入模块

```typescript
import { RoutePlanningModule } from 'react-native-baidu-map';
```

## 驾车路径规划

规划驾车路线，支持多种策略和途经点。

```typescript
import { RoutePlanningModule } from 'react-native-baidu-map';

// 基本驾车路径规划
const drivingOptions = {
  origin: {
    location: { latitude: 39.9042, longitude: 116.4074 },
    name: '天安门'
  },
  destination: {
    location: { latitude: 39.9912, longitude: 116.3348 },
    name: '北京大学'
  },
  policy: 'time_first', // 'time_first' | 'distance_first' | 'fee_first' | 'traffic_first'
  trafficPolicy: 'real_traffic' // 'default' | 'real_traffic' | 'history_traffic'
};

const result = await RoutePlanningModule.planDrivingRoute(drivingOptions);

if (result.success && result.data) {
  console.log('找到', result.data.routes.length, '条路线');
  
  result.data.routes.forEach((route, index) => {
    console.log(`路线 ${index + 1}:`);
    console.log('距离:', RoutePlanningModule.formatDistance(route.distance));
    console.log('时间:', RoutePlanningModule.formatDuration(route.duration));
    console.log('过路费:', route.toll ? `${route.toll}元` : '无');
    
    // 路线步骤
    route.steps.forEach((step, stepIndex) => {
      console.log(`步骤 ${stepIndex + 1}: ${step.instruction}`);
      console.log(`距离: ${step.distance}米, 时间: ${step.duration}秒`);
    });
  });
  
  // 出租车信息
  if (result.data.taxiInfo) {
    console.log('出租车费用:', result.data.taxiInfo.totalPrice, '元');
  }
}

// 带途经点的驾车路径规划
const drivingWithWaypoints = {
  origin: {
    location: { latitude: 39.9042, longitude: 116.4074 },
    name: '起点'
  },
  destination: {
    location: { latitude: 39.9912, longitude: 116.3348 },
    name: '终点'
  },
  waypoints: [
    {
      location: { latitude: 39.9500, longitude: 116.3833 },
      name: '途经点1'
    },
    {
      location: { latitude: 39.9700, longitude: 116.3600 },
      name: '途经点2'
    }
  ],
  policy: 'distance_first'
};

const waypointResult = await RoutePlanningModule.planDrivingRoute(drivingWithWaypoints);
```

## 步行路径规划

规划步行路线。

```typescript
const walkingOptions = {
  origin: {
    location: { latitude: 39.9042, longitude: 116.4074 },
    name: '天安门'
  },
  destination: {
    location: { latitude: 39.9163, longitude: 116.3972 },
    name: '故宫'
  }
};

const result = await RoutePlanningModule.planWalkingRoute(walkingOptions);

if (result.success && result.data) {
  console.log('步行距离:', RoutePlanningModule.formatDistance(result.data.distance));
  console.log('步行时间:', RoutePlanningModule.formatDuration(result.data.duration));
  
  result.data.steps.forEach((step, index) => {
    console.log(`步骤 ${index + 1}: ${step.instruction}`);
  });
}
```

## 公交路径规划

规划公交出行路线。

```typescript
const transitOptions = {
  origin: {
    location: { latitude: 39.9042, longitude: 116.4074 },
    name: '天安门'
  },
  destination: {
    location: { latitude: 39.9912, longitude: 116.3348 },
    name: '北京大学'
  },
  city: '北京市',
  policy: 'time_first' // 'time_first' | 'transfer_first' | 'walk_first' | 'fee_first'
};

const result = await RoutePlanningModule.planTransitRoute(transitOptions);

if (result.success && result.data) {
  result.data.routes.forEach((route, index) => {
    console.log(`公交方案 ${index + 1}:`);
    console.log('总距离:', RoutePlanningModule.formatDistance(route.distance));
    console.log('总时间:', RoutePlanningModule.formatDuration(route.duration));
    console.log('票价:', route.price, '元');
    
    route.steps.forEach((step, stepIndex) => {
      console.log(`步骤 ${stepIndex + 1}: ${step.instruction}`);
      
      if (step.vehicleInfo) {
        console.log('交通工具:', step.vehicleInfo.title);
        console.log('线路名称:', step.vehicleInfo.name);
        console.log('发车时间:', step.vehicleInfo.startTime);
        console.log('到达时间:', step.vehicleInfo.endTime);
      }
    });
  });
}
```

## 骑行路径规划

规划骑行路线。

```typescript
const bikeOptions = {
  origin: {
    location: { latitude: 39.9042, longitude: 116.4074 },
    name: '天安门'
  },
  destination: {
    location: { latitude: 39.9912, longitude: 116.3348 },
    name: '北京大学'
  },
  ridingType: 'electric' // 'common' | 'electric'
};

const result = await RoutePlanningModule.planBikeRoute(bikeOptions);

if (result.success && result.data) {
  console.log('骑行距离:', RoutePlanningModule.formatDistance(result.data.distance));
  console.log('骑行时间:', RoutePlanningModule.formatDuration(result.data.duration));
}
```

## 导航功能

启动实时导航。

```typescript
// 首先规划路线
const drivingResult = await RoutePlanningModule.planDrivingRoute(drivingOptions);

if (drivingResult.success && drivingResult.data && drivingResult.data.routes.length > 0) {
  // 选择第一条路线进行导航
  const selectedRoute = drivingResult.data.routes[0];
  
  const navigationOptions = {
    routeInfo: selectedRoute,
    simulateNavigation: false, // 是否模拟导航
    voiceEnabled: true,        // 是否开启语音
    nightMode: false,          // 是否夜间模式
    showCompass: true,         // 是否显示指南针
    showZoom: true            // 是否显示缩放控件
  };
  
  // 启动导航
  const navResult = await RoutePlanningModule.startNavigation(navigationOptions);
  
  if (navResult.success) {
    console.log('导航启动成功');
    
    // 监听导航状态
    const checkNavStatus = async () => {
      const status = await RoutePlanningModule.getNavigationStatus();
      if (status.success && status.data) {
        console.log('导航状态:', status.data.isNavigating ? '进行中' : '已停止');
        console.log('剩余距离:', RoutePlanningModule.formatDistance(status.data.remainingDistance));
        console.log('剩余时间:', RoutePlanningModule.formatDuration(status.data.remainingTime));
        console.log('当前指令:', status.data.currentInstruction);
      }
    };
    
    // 定期检查导航状态
    const statusInterval = setInterval(checkNavStatus, 5000);
    
    // 5分钟后停止检查（实际应用中根据需要调整）
    setTimeout(() => {
      clearInterval(statusInterval);
    }, 300000);
  }
}
```

## 导航控制

控制导航的暂停、恢复和停止。

```typescript
// 暂停导航
const pauseResult = await RoutePlanningModule.pauseNavigation();
if (pauseResult.success) {
  console.log('导航已暂停');
}

// 恢复导航
const resumeResult = await RoutePlanningModule.resumeNavigation();
if (resumeResult.success) {
  console.log('导航已恢复');
}

// 停止导航
const stopResult = await RoutePlanningModule.stopNavigation();
if (stopResult.success) {
  console.log('导航已停止');
}

// 设置导航语音
const voiceResult = await RoutePlanningModule.setNavigationVoice(true, 'concise');
if (voiceResult.success) {
  console.log('导航语音设置成功');
}
```

## 工具函数

路径规划模块提供了一些实用的工具函数。

```typescript
// 计算两点间距离
const point1 = { latitude: 39.9042, longitude: 116.4074 };
const point2 = { latitude: 39.9912, longitude: 116.3348 };
const distance = RoutePlanningModule.calculateDistance(point1, point2);
console.log('直线距离:', RoutePlanningModule.formatDistance(distance));

// 计算路径总距离
const wayPoints = [
  { latitude: 39.9042, longitude: 116.4074 },
  { latitude: 39.9500, longitude: 116.3833 },
  { latitude: 39.9912, longitude: 116.3348 }
];
const routeDistance = RoutePlanningModule.calculateRouteDistance(wayPoints);
console.log('路径距离:', RoutePlanningModule.formatDistance(routeDistance));

// 格式化距离显示
console.log(RoutePlanningModule.formatDistance(1500)); // "1.5公里"
console.log(RoutePlanningModule.formatDistance(500));  // "500米"

// 格式化时间显示
console.log(RoutePlanningModule.formatDuration(3661)); // "1小时1分钟"
console.log(RoutePlanningModule.formatDuration(300));  // "5分钟"
```

## 错误处理

```typescript
const result = await RoutePlanningModule.planDrivingRoute(options);

if (!result.success) {
  console.error('路径规划失败:', result.error?.message);
  
  switch (result.error?.code) {
    case 'INVALID_PARAMETER':
      console.log('参数无效，请检查起点和终点');
      break;
    case 'NETWORK_ERROR':
      console.log('网络错误，请检查网络连接');
      break;
    case 'SDK_NOT_INITIALIZED':
      console.log('SDK未初始化');
      break;
    default:
      console.log('未知错误');
  }
}
```

## 类型定义

### RouteNode

```typescript
interface RouteNode {
  location: LatLng;
  name?: string;
  uid?: string;
}
```

### RouteInfo

```typescript
interface RouteInfo {
  distance: number;
  duration: number;
  steps: RouteStep[];
  wayPoints: LatLng[];
  startLocation: LatLng;
  endLocation: LatLng;
  toll?: number;
  trafficLightNumber?: number;
  congestionDistance?: number;
}
```

### RouteStep

```typescript
interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  direction: number;
  wayPoints: LatLng[];
  entryLocation?: LatLng;
  exitLocation?: LatLng;
  roadName?: string;
  tollDistance?: number;
  tollGateNumber?: number;
  trafficLightNumber?: number;
}
```

## 完整示例

```typescript
import React, { useState, useEffect } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { RoutePlanningModule, RouteInfo } from 'react-native-baidu-map';

const NavigationExample = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RouteInfo | null>(null);
  const [navigationStatus, setNavigationStatus] = useState<any>(null);

  // 规划路线
  const planRoute = async () => {
    const options = {
      origin: {
        location: { latitude: 39.9042, longitude: 116.4074 },
        name: '天安门'
      },
      destination: {
        location: { latitude: 39.9912, longitude: 116.3348 },
        name: '北京大学'
      },
      policy: 'time_first' as const
    };

    const result = await RoutePlanningModule.planDrivingRoute(options);
    
    if (result.success && result.data && result.data.routes.length > 0) {
      const route = result.data.routes[0];
      setCurrentRoute(route);
      
      Alert.alert(
        '路线规划成功',
        `距离: ${RoutePlanningModule.formatDistance(route.distance)}\n` +
        `时间: ${RoutePlanningModule.formatDuration(route.duration)}`,
        [
          { text: '取消', style: 'cancel' },
          { text: '开始导航', onPress: startNavigation }
        ]
      );
    } else {
      Alert.alert('路线规划失败', result.error?.message || '未知错误');
    }
  };

  // 开始导航
  const startNavigation = async () => {
    if (!currentRoute) return;

    const options = {
      routeInfo: currentRoute,
      simulateNavigation: true, // 演示模式使用模拟导航
      voiceEnabled: true,
      nightMode: false,
      showCompass: true,
      showZoom: true
    };

    const result = await RoutePlanningModule.startNavigation(options);
    
    if (result.success) {
      setIsNavigating(true);
      Alert.alert('导航启动成功', '开始模拟导航');
    } else {
      Alert.alert('导航启动失败', result.error?.message || '未知错误');
    }
  };

  // 停止导航
  const stopNavigation = async () => {
    const result = await RoutePlanningModule.stopNavigation();
    
    if (result.success) {
      setIsNavigating(false);
      setNavigationStatus(null);
      Alert.alert('导航已停止');
    }
  };

  // 监听导航状态
  useEffect(() => {
    if (!isNavigating) return;

    const checkStatus = async () => {
      const status = await RoutePlanningModule.getNavigationStatus();
      if (status.success && status.data) {
        setNavigationStatus(status.data);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [isNavigating]);

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
        路径规划与导航示例
      </Text>
      
      {!isNavigating ? (
        <Button title="规划路线" onPress={planRoute} />
      ) : (
        <View>
          <Text style={{ marginBottom: 10, textAlign: 'center' }}>
            导航进行中...
          </Text>
          
          {navigationStatus && (
            <View style={{ marginBottom: 20 }}>
              <Text>剩余距离: {RoutePlanningModule.formatDistance(navigationStatus.remainingDistance)}</Text>
              <Text>剩余时间: {RoutePlanningModule.formatDuration(navigationStatus.remainingTime)}</Text>
              <Text>当前指令: {navigationStatus.currentInstruction}</Text>
            </View>
          )}
          
          <Button title="停止导航" onPress={stopNavigation} color="red" />
        </View>
      )}
    </View>
  );
};

export default NavigationExample;
```

这个路径规划API提供了完整的路线规划和导航功能，支持多种出行方式和导航控制，可以满足各种导航应用的需求。