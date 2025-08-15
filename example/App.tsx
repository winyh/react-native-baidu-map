import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  MapView,
  Marker,
  Polyline,
  Polygon,
  InfoWindow,
  BaiduMapModule,
  LocationModule,
  MapType,
  LocationMode,
  CoordinateType,
  LatLng,
  MapViewMethods,
  PermissionManager,
  Logger,
  LogLevel,
} from '@react-native/winyh-baidu-map';

const BEIJING_CENTER: LatLng = {
  latitude: 39.915,
  longitude: 116.404,
};

const SAMPLE_MARKERS: Array<{ coordinate: LatLng; title: string; description: string }> = [
  {
    coordinate: { latitude: 39.915, longitude: 116.404 },
    title: '天安门',
    description: '北京市中心',
  },
  {
    coordinate: { latitude: 39.916, longitude: 116.397 },
    title: '故宫',
    description: '明清两代的皇家宫殿',
  },
  {
    coordinate: { latitude: 39.928, longitude: 116.388 },
    title: '景山公园',
    description: '俯瞰紫禁城的最佳地点',
  },
];

const SAMPLE_POLYLINE: LatLng[] = [
  { latitude: 39.915, longitude: 116.404 },
  { latitude: 39.916, longitude: 116.397 },
  { latitude: 39.928, longitude: 116.388 },
  { latitude: 39.935, longitude: 116.395 },
];

const SAMPLE_POLYGON: LatLng[] = [
  { latitude: 39.910, longitude: 116.400 },
  { latitude: 39.920, longitude: 116.400 },
  { latitude: 39.920, longitude: 116.410 },
  { latitude: 39.910, longitude: 116.410 },
];

const App: React.FC = () => {
  const mapRef = useRef<MapViewMethods>(null);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [mapType, setMapType] = useState<MapType>(MapType.NORMAL);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolyline, setShowPolyline] = useState(false);
  const [showPolygon, setShowPolygon] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isLocationWatching, setIsLocationWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    initializeSDK();
    configureLogger();
    return () => {
      // 清理资源
      if (watchId !== null) {
        LocationModule.clearWatch(watchId);
      }
      LocationModule.clearAllWatches();
    };
  }, []);

  const configureLogger = () => {
    Logger.configure({
      level: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsole: true,
      enableTimestamp: true,
    });
    Logger.info('示例应用启动');
  };

  const initializeSDK = async () => {
    try {
      Logger.info('开始初始化百度地图SDK');
      
      // 设置用户协议确认状态
      await BaiduMapModule.setAgreePrivacy(true);
      
      // 初始化SDK
      const result = await BaiduMapModule.initialize({
        apiKey: 'YOUR_API_KEY_HERE', // 请替换为您的API Key
        enableLocation: true,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
      });

      if (result.success) {
        setIsSDKInitialized(true);
        Logger.info('百度地图SDK初始化成功');
        Alert.alert('成功', '百度地图SDK初始化成功');
      } else {
        Logger.error('百度地图SDK初始化失败', result.error);
        Alert.alert('错误', `SDK初始化失败: ${result.error?.message}`);
      }
    } catch (error) {
      Logger.error('初始化SDK时发生异常', error);
      Alert.alert('错误', '初始化SDK时发生异常');
    }
  };

  const requestLocationPermission = async () => {
    try {
      Logger.info('请求定位权限');
      const result = await PermissionManager.ensureLocationPermission();
      
      if (result.status === 'granted') {
        Alert.alert('成功', '定位权限已获取');
        return true;
      } else {
        Alert.alert('权限被拒绝', PermissionManager.getPermissionStatusDescription(result.status));
        return false;
      }
    } catch (error) {
      Logger.error('请求定位权限失败', error);
      Alert.alert('错误', '请求定位权限失败');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Logger.info('开始获取当前位置');
      const timerId = Logger.startPerformanceTimer('getCurrentLocation');
      
      const location = await LocationModule.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
        needAddress: true,
      });

      Logger.endPerformanceTimer(timerId, true);
      Logger.info('获取位置成功', location);

      setCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // 移动地图到当前位置
      if (mapRef.current) {
        await mapRef.current.setCenter({
          latitude: location.latitude,
          longitude: location.longitude,
        }, true);
      }

      Alert.alert(
        '定位成功',
        `纬度: ${location.latitude.toFixed(6)}\n经度: ${location.longitude.toFixed(6)}\n地址: ${location.address || '未知'}`
      );
    } catch (error) {
      Logger.error('获取位置失败', error);
      Alert.alert('定位失败', error.message || '获取位置失败');
    }
  };

  const startLocationWatch = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      if (isLocationWatching) {
        // 停止监听
        if (watchId !== null) {
          LocationModule.clearWatch(watchId);
          setWatchId(null);
        }
        setIsLocationWatching(false);
        Logger.info('停止位置监听');
        Alert.alert('提示', '已停止位置监听');
        return;
      }

      Logger.info('开始位置监听');
      const id = LocationModule.watchPosition(
        (location) => {
          Logger.info('位置更新', location);
          setCurrentLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        },
        (error) => {
          Logger.error('位置监听错误', error);
          Alert.alert('定位错误', error.message);
        },
        {
          enableHighAccuracy: true,
          interval: 5000,
          locationMode: LocationMode.HIGH_ACCURACY,
          coordinateType: CoordinateType.BD09LL,
          needAddress: true,
        }
      );

      setWatchId(id);
      setIsLocationWatching(true);
      Alert.alert('提示', '开始位置监听');
    } catch (error) {
      Logger.error('启动位置监听失败', error);
      Alert.alert('错误', '启动位置监听失败');
    }
  };

  const changeMapType = () => {
    const types = [MapType.NORMAL, MapType.SATELLITE, MapType.HYBRID];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    const nextType = types[nextIndex];
    
    setMapType(nextType);
    Logger.info('切换地图类型', { from: mapType, to: nextType });
  };

  const takeSnapshot = async () => {
    try {
      if (!mapRef.current) return;
      
      Logger.info('开始截取地图快照');
      const timerId = Logger.startPerformanceTimer('takeSnapshot');
      
      const result = await mapRef.current.takeSnapshot();
      
      Logger.endPerformanceTimer(timerId, result.success);
      
      if (result.success) {
        Logger.info('截图成功', { path: result.data });
        Alert.alert('成功', `截图已保存: ${result.data}`);
      } else {
        Logger.error('截图失败', result.error);
        Alert.alert('失败', `截图失败: ${result.error?.message}`);
      }
    } catch (error) {
      Logger.error('截图异常', error);
      Alert.alert('错误', '截图时发生异常');
    }
  };

  const showPerformanceStats = () => {
    const stats = Logger.getPerformanceStats();
    const message = `
总操作数: ${stats.totalOperations}
成功率: ${stats.successRate.toFixed(1)}%
平均耗时: ${stats.averageDuration.toFixed(2)}ms
最慢操作: ${stats.slowestOperation?.operation || '无'} (${stats.slowestOperation?.duration.toFixed(2) || 0}ms)
最快操作: ${stats.fastestOperation?.operation || '无'} (${stats.fastestOperation?.duration.toFixed(2) || 0}ms)
    `.trim();
    
    Alert.alert('性能统计', message);
  };

  const handleMapClick = (event: any) => {
    Logger.logUserInteraction('mapClick', event);
    setSelectedMarker(null);
  };

  const handleMarkerPress = (index: number) => {
    Logger.logUserInteraction('markerPress', { index });
    setSelectedMarker(selectedMarker === index ? null : index);
  };

  const renderControlButtons = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlContainer}>
      <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
        <Text style={styles.buttonText}>定位</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, isLocationWatching && styles.activeButton]} 
        onPress={startLocationWatch}
      >
        <Text style={styles.buttonText}>
          {isLocationWatching ? '停止监听' : '监听位置'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={changeMapType}>
        <Text style={styles.buttonText}>
          {mapType === MapType.NORMAL ? '普通' : 
           mapType === MapType.SATELLITE ? '卫星' : '混合'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, showMarkers && styles.activeButton]} 
        onPress={() => setShowMarkers(!showMarkers)}
      >
        <Text style={styles.buttonText}>标记</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, showPolyline && styles.activeButton]} 
        onPress={() => setShowPolyline(!showPolyline)}
      >
        <Text style={styles.buttonText}>折线</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, showPolygon && styles.activeButton]} 
        onPress={() => setShowPolygon(!showPolygon)}
      >
        <Text style={styles.buttonText}>多边形</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={takeSnapshot}>
        <Text style={styles.buttonText}>截图</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={showPerformanceStats}>
        <Text style={styles.buttonText}>性能</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (!isSDKInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在初始化百度地图SDK...</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeSDK}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>百度地图示例</Text>
        {currentLocation && (
          <Text style={styles.locationText}>
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          center={currentLocation || BEIJING_CENTER}
          zoom={15}
          mapType={mapType}
          showsUserLocation={true}
          userLocationAccuracyCircleEnabled={true}
          showsCompass={true}
          showsScale={true}
          zoomControlsEnabled={true}
          onMapClick={handleMapClick}
          onMapLoaded={() => Logger.info('地图加载完成')}
        >
          {/* 示例标记 */}
          {showMarkers && SAMPLE_MARKERS.map((marker, index) => (
            <Marker
              key={index}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={() => handleMarkerPress(index)}
            >
              {selectedMarker === index && (
                <InfoWindow coordinate={marker.coordinate}>
                  <View style={styles.infoWindow}>
                    <Text style={styles.infoTitle}>{marker.title}</Text>
                    <Text style={styles.infoDescription}>{marker.description}</Text>
                  </View>
                </InfoWindow>
              )}
            </Marker>
          ))}

          {/* 当前位置标记 */}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="当前位置"
              description="您的当前位置"
            />
          )}

          {/* 示例折线 */}
          {showPolyline && (
            <Polyline
              coordinates={SAMPLE_POLYLINE}
              color="#FF0000"
              width={5}
            />
          )}

          {/* 示例多边形 */}
          {showPolygon && (
            <Polygon
              coordinates={SAMPLE_POLYGON}
              strokeColor="#0000FF"
              strokeWidth={2}
              fillColor="#0000FF40"
            />
          )}
        </MapView>
      </View>

      {renderControlButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controlContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  infoWindow: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default App;