import React, { useState, useRef } from 'react';
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
  MapView,
  RoutePlanningModule,
  Logger,
  LatLng,
  MapViewMethods,
  Polyline,
} from '@react-native/winyh-baidu-map';

interface Props {
  onGoBack: () => void;
}

const BEIJING_CENTER: LatLng = {
  latitude: 39.915,
  longitude: 116.404,
};

const RoutePlanningScreen: React.FC<Props> = ({ onGoBack }) => {
  const mapRef = useRef<MapViewMethods>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null);

  const planRoute = async () => {
    try {
      const start = { latitude: 39.915, longitude: 116.404 };
      const end = { latitude: 39.955, longitude: 116.434 };
      
      Logger.info('开始路线规划', { start, end });
      const result = await RoutePlanningModule.plan({
        start,
        end,
        mode: 'driving',
      });
      Logger.info('路线规划成功', result);

      if (result.routes.length > 0) {
        setRoute(result.routes[0].points);
        if (mapRef.current) {
          // This is a simplified example, in a real app you would want to fit the route
          mapRef.current.setCenter(start, true);
        }
      } else {
        Alert.alert('提示', '未找到路线');
      }
    } catch (error) {
      Logger.error('路线规划失败', error);
      Alert.alert('路线规划失败', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Text style={styles.backButton}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>路线规划</Text>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        center={BEIJING_CENTER}
        zoom={12}
      >
        {route && (
          <Polyline
            coordinates={route}
            color="#00BFFF"
            width={8}
          />
        )}
      </MapView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={planRoute}>
          <Text style={styles.buttonText}>规划路线</Text>
        </TouchableOpacity>
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
  map: {
    flex: 1,
  },
  controls: {
    padding: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RoutePlanningScreen;