import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import HomeScreen from './HomeScreen';
import BasicMapScreen from './screens/BasicMapScreen';
import LocationScreen from './screens/LocationScreen';
import GeocodingScreen from './screens/GeocodingScreen';
import RoutePlanningScreen from './screens/RoutePlanningScreen';
import HeatMapScreen from './screens/HeatMapScreen';
import CustomMapStyleScreen from './screens/CustomMapStyleScreen';
import { BaiduMapModule, LocationModule, Logger, LogLevel, PermissionManager, CoordinateType, LocationMode } from '@react-native/winyh-baidu-map';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);

  useEffect(() => {
    initializeSDK();
    configureLogger();
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
      
      await BaiduMapModule.setAgreePrivacy(true);
      
      await BaiduMapModule.initialize({
        apiKey: 'YOUR_API_KEY_HERE', // 请替换为您的API Key
        enableLocation: true,
        locationMode: LocationMode.HIGH_ACCURACY,
        coordinateType: CoordinateType.BD09LL,
      });

      setIsSDKInitialized(true);
      Logger.info('百度地图SDK初始化成功');
    } catch (error) {
      Logger.error('初始化SDK时发生异常', error);
      Alert.alert('错误', '初始化SDK时发生异常');
    }
  };

  const renderScreen = () => {
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

    switch (currentScreen) {
      case 'home':
        return <HomeScreen onSelect={setCurrentScreen} />;
      case 'basic':
        return <BasicMapScreen onGoBack={() => setCurrentScreen('home')} />;
      case 'location':
        return <LocationScreen onGoBack={() => setCurrentScreen('home')} />;
      case 'geocoding':
        return <GeocodingScreen onGoBack={() => setCurrentScreen('home')} />;
      case 'route_planning':
        return <RoutePlanningScreen onGoBack={() => setCurrentScreen('home')} />;
      case 'heatmap':
        return <HeatMapScreen onGoBack={() => setCurrentScreen('home')} />;
      case 'custom_style':
        return <CustomMapStyleScreen onGoBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen onSelect={setCurrentScreen} />;
    }
  };

  return renderScreen();
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
});

export default App;