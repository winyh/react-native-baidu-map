import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import {
  MapView,
  Marker,
  Polyline,
  Polygon,
  InfoWindow,
  BaiduMapModule,
  LocationModule,
  PermissionManager,
  CoordinateConverter,
  PerformanceOptimizer,
  Logger,
  MapType,
  LocationMode,
  CoordinateType,
  LatLng,
  MapViewMethods,
  LocationResult,
} from '@react-native/winyh-baidu-map';

const BEIJING_CENTER: LatLng = {
  latitude: 39.915,
  longitude: 116.404,
};

// 模拟大量标记数据
const generateRandomMarkers = (count: number): Array<{ id: number; coordinate: LatLng; title: string }> => {
  const markers = [];
  for (let i = 0; i < count; i++) {
    const lat = BEIJING_CENTER.latitude + (Math.random() - 0.5) * 0.1;
    const lng = BEIJING_CENTER.longitude + (Math.random() - 0.5) * 0.1;
    markers.push({
      id: i + 1,
      coordinate: { latitude: lat, longitude: lng },
      title: `标记 ${i + 1}`,
    });
  }
  return markers;
};

const ComplexExample: React.FC = () => {
  const mapRef = useRef<MapViewMethods>(null);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [mapType, setMapType] = useState<MapType>(MapType.NORMAL);
  const [allMarkers] = useState(() => generateRandomMarkers(100)); // 100个标记
  const [visibleMarkers, setVisibleMarkers] = useState<typeof allMarkers>([]);
  const [clusteredMarkers, setClusteredMarkers] = useState<any[]>([]);
  const [enableClustering, setEnableClustering] = useState(true);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [isLocationWatching, setIsLocationWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationResult[]>([]);

  useEffect(() => {
    initializeSDK();
    return () => {
      if (watchId !== null) {
        LocationModule.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    updateVisibleMarkers();
  }, [currentZoom, enableClustering]);

  const initializeSDK = async () => {
    try {
      Logger.info('开始初始化复杂示例');
      await BaiduMapModule.setAgreePrivacy(true);
      
      const result = await BaiduMapModule.initialize({
        apiKey: 'YOUR_API_KEY_HERE',
        enableLocation: true,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
      });

      if (result.success) {
        setIsSDKInitialized(true);
        Logger.info('SDK初始化成功');
        updateVisibleMarkers();
      } else {
        Logger.error('SDK初始化失败', result.error);
        Alert.alert('错误', `SDK初始化失败: ${result.error?.message}`);
      }
    } catch (error) {
      Logger.error('初始化SDK异常', error);
      Alert.alert('错误', '初始化SDK时发生异常');
    }
  };

  const updateVisibleMarkers = () => {
    const timerId = Logger.startPerformanceTimer('updateVisibleMarkers');
    
    try {
      if (enableClustering) {
        // 使用标记聚合
        const clusters = PerformanceOptimizer.clusterMarkers(
          allMarkers,
          currentZoom,
          50 // 聚合半径
        );
        setClusteredMarkers(clusters);
        setVisibleMarkers([]);
        Logger.info(`标记聚合完成，${allMarkers.length} 个标记聚合为 ${clusters.length} 个聚合点`);
      } else {
        // 不使用聚合，直接显示所有标记
        setVisibleMarkers(allMarkers);
        setClusteredMarkers([]);
      }
      
      Logger.endPerformanceTimer(timerId, true);
    } catch (error) {
      Logger.endPerformanceTimer(timerId, false, error);
      Logger.error('更新可见标记失败', error);
    }
  };

  const handleMapStatusChange = (event: any) => {
    const newZoom = event.zoom;
    if (Math.abs(newZoom - currentZoom) > 0.5) {
      setCurrentZoom(newZoom);
      Logger.info('地图缩放级别变化', { from: currentZoom, to: newZoom });
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await PermissionManager.ensureLocationPermission();
      if (!hasPermission) return;

      const timerId = Logger.startPerformanceTimer('getCurrentLocation');
      const location = await LocationModule.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
        needAddress: true,
      });

      Logger.endPerformanceTimer(timerId, true);
      setCurrentLocation({ latitude: location.latitude, longitude: location.longitude });
      setLocationHistory(prev => [location, ...prev.slice(0, 4)]); // 保留最近5次

      // 移动地图到当前位置
      if (mapRef.current) {
        await mapRef.current.setCenter({
          latitude: location.latitude,
          longitude: location.longitude,
        }, true);
      }

      Alert.alert('定位成功', `地址: ${location.address || '未知'}`);
    } catch (error) {
      Logger.error('获取位置失败', error);
      Alert.alert('定位失败', error.message || '获取位置失败');
    }
  };

  const startLocationWatch = async () => {
    if (isLocationWatching) {
      if (watchId !== null) {
        LocationModule.clearWatch(watchId);
        setWatchId(null);
      }
      setIsLocationWatching(false);
      Logger.info('停止位置监听');
      return;
    }

    try {
      const hasPermission = await PermissionManager.ensureLocationPermission();
      if (!hasPermission) return;

      const id = LocationModule.watchPosition(
        (location) => {
          setCurrentLocation({ latitude: location.latitude, longitude: location.longitude });
          setLocationHistory(prev => [location, ...prev.slice(0, 4)]);
          Logger.info('位置更新', { lat: location.latitude, lng: location.longitude });
        },
        (error) => {
          Logger.error('位置监听错误', error);
        },
        {
          enableHighAccuracy: true,
          interval: 5000,
          locationMode: LocationMode.HIGH_ACCURACY,
          coordinateType: CoordinateType.BD09LL,
        }
      );

      setWatchId(id);
      setIsLocationWatching(true);
      Logger.info('开始位置监听');
    } catch (error) {
      Logger.error('启动位置监听失败', error);
    }
  };

  const testCoordinateConversion = async () => {
    try {
      const testCoord: LatLng = { latitude: 39.915, longitude: 116.404 };
      
      Logger.info('开始坐标转换测试');
      const timerId = Logger.startPerformanceTimer('coordinateConversion');
      
      // 测试 BD09 到 GCJ02 转换
      const result = await CoordinateConverter.convertCoordinate(
        testCoord,
        CoordinateType.BD09LL,
        CoordinateType.GCJ02
      );
      
      Logger.endPerformanceTimer(timerId, result.success);
      
      if (result.success) {
        Alert.alert(
          '坐标转换测试',
          `原坐标 (BD09): ${testCoord.latitude.toFixed(6)}, ${testCoord.longitude.toFixed(6)}\n` +
          `转换后 (GCJ02): ${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`
        );
      } else {
        Alert.alert('转换失败', result.error || '坐标转换失败');
      }
    } catch (error) {
      Logger.error('坐标转换测试失败', error);
      Alert.alert('错误', '坐标转换测试失败');
    }
  };

  const showPerformanceStats = () => {
    const stats = Logger.getPerformanceStats();
    setPerformanceStats(stats);
    setShowPerformanceModal(true);
  };

  const clearPerformanceData = () => {
    Logger.clearPerformanceMetrics();
    PerformanceOptimizer.cleanup();
    Alert.alert('提示', '性能数据已清空');
  };

  const takeMapSnapshot = async () => {
    try {
      if (!mapRef.current) return;
      
      const timerId = Logger.startPerformanceTimer('takeSnapshot');
      const result = await mapRef.current.takeSnapshot();
      Logger.endPerformanceTimer(timerId, result.success);
      
      if (result.success) {
        Alert.alert('截图成功', `已保存到: ${result.data}`);
      } else {
        Alert.alert('截图失败', result.error?.message || '截图失败');
      }
    } catch (error) {
      Logger.error('截图异常', error);
      Alert.alert('错误', '截图时发生异常');
    }
  };

  const renderClusteredMarkers = () => {
    return clusteredMarkers.map((cluster, index) => {
      if (cluster.isCluster) {
        // 渲染聚合标记
        return (
          <Marker
            key={`cluster-${index}`}
            coordinate={cluster.coordinate}
            title={`聚合点 (${cluster.count})`}
            description={`包含 ${cluster.count} 个标记`}
          >
            <View style={styles.clusterMarker}>
              <Text style={styles.clusterText}>{cluster.count}</Text>
            </View>
          </Marker>
        );
      } else {
        // 渲染单个标记
        const marker = cluster.markers[0];
        return (
          <Marker
            key={`marker-${marker.id}`}
            coordinate={marker.coordinate}
            title={marker.title}
            description={`标记 ID: ${marker.id}`}
          />
        );
      }
    });
  };

  const renderPerformanceModal = () => (
    <Modal
      visible={showPerformanceModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPerformanceModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>性能统计</Text>
          
          {performanceStats && (
            <ScrollView style={styles.statsContainer}>
              <Text style={styles.statItem}>总操作数: {performanceStats.totalOperations}</Text>
              <Text style={styles.statItem}>成功率: {performanceStats.successRate.toFixed(1)}%</Text>
              <Text style={styles.statItem}>平均耗时: {performanceStats.averageDuration.toFixed(2)}ms</Text>
              
              {performanceStats.slowestOperation && (
                <Text style={styles.statItem}>
                  最慢操作: {performanceStats.slowestOperation.operation} 
                  ({performanceStats.slowestOperation.duration.toFixed(2)}ms)
                </Text>
              )}
              
              {performanceStats.fastestOperation && (
                <Text style={styles.statItem}>
                  最快操作: {performanceStats.fastestOperation.operation} 
                  ({performanceStats.fastestOperation.duration.toFixed(2)}ms)
                </Text>
              )}
              
              <Text style={styles.sectionTitle}>操作统计:</Text>
              {Object.entries(performanceStats.operationStats).map(([operation, stats]: [string, any]) => (
                <View key={operation} style={styles.operationStat}>
                  <Text style={styles.operationName}>{operation}</Text>
                  <Text style={styles.operationDetail}>
                    次数: {stats.count}, 成功率: {stats.successRate.toFixed(1)}%, 
                    平均: {stats.averageDuration.toFixed(2)}ms
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.clearButton]} 
              onPress={clearPerformanceData}
            >
              <Text style={styles.modalButtonText}>清空数据</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.closeButton]} 
              onPress={() => setShowPerformanceModal(false)}
            >
              <Text style={styles.modalButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!isSDKInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在初始化百度地图SDK...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>复杂场景综合示例</Text>
        <Text style={styles.subtitle}>
          标记: {enableClustering ? `${clusteredMarkers.length} 聚合点` : `${visibleMarkers.length} 个`} | 
          缩放: {currentZoom.toFixed(1)}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          center={currentLocation || BEIJING_CENTER}
          zoom={currentZoom}
          mapType={mapType}
          showsUserLocation={true}
          userLocationAccuracyCircleEnabled={true}
          showsCompass={true}
          showsScale={true}
          zoomControlsEnabled={true}
          onMapStatusChange={handleMapStatusChange}
          onMapLoaded={() => Logger.info('地图加载完成')}
        >
          {/* 当前位置标记 */}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="当前位置"
              description="您的当前位置"
            />
          )}

          {/* 渲染聚合标记或普通标记 */}
          {enableClustering ? renderClusteredMarkers() : visibleMarkers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={`标记 ID: ${marker.id}`}
            />
          ))}

          {/* 位置历史轨迹 */}
          {locationHistory.length > 1 && (
            <Polyline
              coordinates={locationHistory.map(loc => ({ latitude: loc.latitude, longitude: loc.longitude }))}
              color="#FF0000"
              width={3}
            />
          )}
        </MapView>
      </View>

      {/* 控制面板 */}
      <View style={styles.controlPanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
            <Text style={styles.buttonText}>定位</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isLocationWatching && styles.activeButton]} 
            onPress={startLocationWatch}
          >
            <Text style={styles.buttonText}>
              {isLocationWatching ? '停止' : '监听'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={testCoordinateConversion}>
            <Text style={styles.buttonText}>坐标转换</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={takeMapSnapshot}>
            <Text style={styles.buttonText}>截图</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={showPerformanceStats}>
            <Text style={styles.buttonText}>性能</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 设置开关 */}
        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>标记聚合</Text>
            <Switch
              value={enableClustering}
              onValueChange={setEnableClustering}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={enableClustering ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.mapTypeButton} 
            onPress={() => {
              const types = [MapType.NORMAL, MapType.SATELLITE, MapType.HYBRID];
              const currentIndex = types.indexOf(mapType);
              const nextIndex = (currentIndex + 1) % types.length;
              setMapType(types[nextIndex]);
            }}
          >
            <Text style={styles.mapTypeText}>
              {mapType === MapType.NORMAL ? '普通' : 
               mapType === MapType.SATELLITE ? '卫星' : '混合'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 位置历史 */}
        {locationHistory.length > 0 && (
          <View style={styles.locationHistory}>
            <Text style={styles.historyTitle}>位置历史 ({locationHistory.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {locationHistory.map((location, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyIndex}>{index + 1}</Text>
                  <Text style={styles.historyCoord}>
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {renderPerformanceModal()}
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
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  clusterMarker: {
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  clusterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlPanel: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
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
  settingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  mapTypeButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  mapTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  locationHistory: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    minWidth: 100,
  },
  historyIndex: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  historyCoord: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginVertical: 2,
  },
  historyTime: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsContainer: {
    maxHeight: 400,
  },
  statItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  operationStat: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  operationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  operationDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  closeButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ComplexExample;