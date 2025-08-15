import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  MapView,
  Marker,
  BaiduMapModule,
  LocationModule,
  PermissionManager,
  MapType,
  LocationMode,
  CoordinateType,
  LatLng,
  LocationResult,
} from '@react-native/winyh-baidu-map';

const DEFAULT_CENTER: LatLng = {
  latitude: 39.915,
  longitude: 116.404,
};

const LocationExample: React.FC = () => {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationResult | null>(null);
  const [isLocationWatching, setIsLocationWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationResult[]>([]);

  useEffect(() => {
    initializeSDK();
    return () => {
      // 清理资源
      if (watchId !== null) {
        LocationModule.clearWatch(watchId);
      }
    };
  }, []);

  const initializeSDK = async () => {
    try {
      await BaiduMapModule.setAgreePrivacy(true);
      
      const result = await BaiduMapModule.initialize({
        apiKey: 'YOUR_API_KEY_HERE',
        enableLocation: true,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
      });

      if (result.success) {
        setIsSDKInitialized(true);
      } else {
        Alert.alert('错误', `SDK初始化失败: ${result.error?.message}`);
      }
    } catch (error) {
      Alert.alert('错误', '初始化SDK时发生异常');
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const result = await PermissionManager.ensureLocationPermission();
      return result.status === 'granted';
    } catch (error) {
      Alert.alert('错误', '请求定位权限失败');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const location = await LocationModule.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
        needAddress: true,
        needLocationDescribe: true,
      });

      setCurrentLocation(location);
      setLocationHistory(prev => [location, ...prev.slice(0, 9)]); // 保留最近10次定位

      Alert.alert(
        '定位成功',
        `纬度: ${location.latitude.toFixed(6)}\n经度: ${location.longitude.toFixed(6)}\n精度: ${location.accuracy}米\n地址: ${location.address || '未知'}`
      );
    } catch (error) {
      Alert.alert('定位失败', error.message || '获取位置失败');
    }
  };

  const startLocationWatch = async () => {
    if (isLocationWatching) {
      // 停止监听
      if (watchId !== null) {
        LocationModule.clearWatch(watchId);
        setWatchId(null);
      }
      setIsLocationWatching(false);
      Alert.alert('提示', '已停止位置监听');
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const id = LocationModule.watchPosition(
        (location) => {
          console.log('位置更新:', location);
          setCurrentLocation(location);
          setLocationHistory(prev => [location, ...prev.slice(0, 9)]);
        },
        (error) => {
          console.error('位置监听错误:', error);
          Alert.alert('定位错误', error.message);
        },
        {
          enableHighAccuracy: true,
          interval: 3000, // 3秒更新一次
          locationMode: LocationMode.HIGH_ACCURACY,
          coordinateType: CoordinateType.BD09LL,
          needAddress: true,
        }
      );

      setWatchId(id);
      setIsLocationWatching(true);
      Alert.alert('提示', '开始位置监听，每3秒更新一次');
    } catch (error) {
      Alert.alert('错误', '启动位置监听失败');
    }
  };

  const checkLocationService = async () => {
    try {
      const isEnabled = await LocationModule.isLocationServiceEnabled();
      Alert.alert(
        '定位服务状态',
        isEnabled ? '定位服务已开启' : '定位服务未开启'
      );
    } catch (error) {
      Alert.alert('错误', '检查定位服务状态失败');
    }
  };

  const clearLocationHistory = () => {
    setLocationHistory([]);
    Alert.alert('提示', '位置历史已清空');
  };

  const renderLocationInfo = () => {
    if (!currentLocation) return null;

    return (
      <View style={styles.locationInfo}>
        <Text style={styles.locationTitle}>当前位置信息</Text>
        <Text style={styles.locationText}>纬度: {currentLocation.latitude.toFixed(6)}</Text>
        <Text style={styles.locationText}>经度: {currentLocation.longitude.toFixed(6)}</Text>
        <Text style={styles.locationText}>精度: {currentLocation.accuracy}米</Text>
        {currentLocation.altitude && (
          <Text style={styles.locationText}>海拔: {currentLocation.altitude.toFixed(1)}米</Text>
        )}
        {currentLocation.speed && (
          <Text style={styles.locationText}>速度: {(currentLocation.speed * 3.6).toFixed(1)}km/h</Text>
        )}
        {currentLocation.address && (
          <Text style={styles.locationText}>地址: {currentLocation.address}</Text>
        )}
        <Text style={styles.locationText}>
          更新时间: {new Date(currentLocation.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  const renderLocationHistory = () => {
    if (locationHistory.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>位置历史 ({locationHistory.length})</Text>
          <TouchableOpacity onPress={clearLocationHistory}>
            <Text style={styles.clearButton}>清空</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
          {locationHistory.map((location, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyIndex}>{index + 1}</Text>
              <View style={styles.historyContent}>
                <Text style={styles.historyCoord}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(location.timestamp).toLocaleTimeString()}
                </Text>
                {location.address && (
                  <Text style={styles.historyAddress} numberOfLines={1}>
                    {location.address}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

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
        <Text style={styles.title}>定位功能演示</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          center={currentLocation ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : DEFAULT_CENTER}
          zoom={16}
          mapType={MapType.NORMAL}
          showsUserLocation={true}
          userLocationAccuracyCircleEnabled={true}
          showsCompass={true}
          showsScale={true}
          zoomControlsEnabled={true}
        >
          {currentLocation && (
            <Marker
              coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
              title="当前位置"
              description={currentLocation.address || '您的当前位置'}
            />
          )}
        </MapView>
      </View>

      <View style={styles.controlContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
            <Text style={styles.buttonText}>单次定位</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isLocationWatching && styles.activeButton]} 
            onPress={startLocationWatch}
          >
            <Text style={styles.buttonText}>
              {isLocationWatching ? '停止监听' : '连续定位'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={checkLocationService}>
            <Text style={styles.buttonText}>检查服务</Text>
          </TouchableOpacity>
        </View>

        {renderLocationInfo()}
        {renderLocationHistory()}
      </View>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controlContainer: {
    backgroundColor: 'white',
    maxHeight: 300,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  locationInfo: {
    backgroundColor: '#f8f8f8',
    margin: 15,
    padding: 15,
    borderRadius: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  historyContainer: {
    margin: 15,
    marginTop: 0,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    color: '#FF3B30',
    fontSize: 14,
  },
  historyList: {
    maxHeight: 120,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 5,
    borderRadius: 5,
  },
  historyIndex: {
    fontSize: 12,
    color: '#999',
    width: 20,
    textAlign: 'center',
  },
  historyContent: {
    flex: 1,
    marginLeft: 10,
  },
  historyCoord: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyAddress: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default LocationExample;