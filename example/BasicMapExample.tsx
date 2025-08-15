import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  MapView,
  BaiduMapModule,
  MapType,
  LocationMode,
  CoordinateType,
  LatLng,
} from '@react-native/winyh-baidu-map';

const BEIJING_CENTER: LatLng = {
  latitude: 39.915,
  longitude: 116.404,
};

const BasicMapExample: React.FC = () => {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      // 设置用户协议确认状态
      await BaiduMapModule.setAgreePrivacy(true);
      
      // 初始化SDK
      const result = await BaiduMapModule.initialize({
        apiKey: 'YOUR_API_KEY_HERE', // 请替换为您的API Key
        enableLocation: false,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
      });

      if (result.success) {
        setIsSDKInitialized(true);
        console.log('百度地图SDK初始化成功');
      } else {
        console.error('百度地图SDK初始化失败:', result.error);
        Alert.alert('错误', `SDK初始化失败: ${result.error?.message}`);
      }
    } catch (error) {
      console.error('初始化SDK时发生异常:', error);
      Alert.alert('错误', '初始化SDK时发生异常');
    }
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
        <Text style={styles.title}>基础地图显示示例</Text>
      </View>

      <MapView
        style={styles.map}
        center={BEIJING_CENTER}
        zoom={12}
        mapType={MapType.NORMAL}
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
        zoomControlsEnabled={true}
        onMapLoaded={() => console.log('地图加载完成')}
        onMapClick={(event) => {
          console.log('地图点击:', event);
          Alert.alert(
            '地图点击',
            `坐标: ${event.coordinate.latitude.toFixed(6)}, ${event.coordinate.longitude.toFixed(6)}`
          );
        }}
      />
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
  map: {
    flex: 1,
  },
});

export default BasicMapExample;