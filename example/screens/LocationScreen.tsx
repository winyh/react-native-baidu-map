import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  LocationModule,
  LocationMode,
  CoordinateType,
  LatLng,
  PermissionManager,
  Logger,
} from '@react-native/winyh-baidu-map';

interface Props {
  onGoBack: () => void;
}

const LocationScreen: React.FC<Props> = ({ onGoBack }) => {
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [isLocationWatching, setIsLocationWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        LocationModule.clearWatch(watchId);
      }
    };
  }, [watchId]);

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
      const location = await LocationModule.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
        needAddress: true,
      });

      Logger.info('获取位置成功', location);
      setCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      Alert.alert(
        '定位成功',
        `纬度: ${location.latitude.toFixed(6)}
经度: ${location.longitude.toFixed(6)}
地址: ${location.address || '未知'}`
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Text style={styles.backButton}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>定位功能</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
          <Text style={styles.buttonText}>获取当前位置</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, isLocationWatching && styles.activeButton]} 
          onPress={startLocationWatch}
        >
          <Text style={styles.buttonText}>
            {isLocationWatching ? '停止监听位置' : '开始监听位置'}
          </Text>
        </TouchableOpacity>
        {currentLocation && (
          <Text style={styles.locationText}>
            当前位置: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  locationText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LocationScreen;
