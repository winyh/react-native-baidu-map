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
  BaiduMapModule,
  Logger,
  LatLng,
  MapViewMethods,
} from '@react-native/winyh-baidu-map';

interface Props {
  onGoBack: () => void;
}

const BEIJING_CENTER: LatLng = {
  latitude: 39.915,
  longitude: 116.404,
};

const HEATMAP_DATA: LatLng[] = new Array(100).fill(0).map(() => ({
  latitude: 39.915 + (Math.random() - 0.5) * 0.1,
  longitude: 116.404 + (Math.random() - 0.5) * 0.1,
}));

const HeatMapScreen: React.FC<Props> = ({ onGoBack }) => {
  const mapRef = useRef<MapViewMethods>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);

  const toggleHeatMap = async () => {
    try {
      if (showHeatMap) {
        await BaiduMapModule.removeHeatMap();
        setShowHeatMap(false);
        Alert.alert('提示', '热力图已移除');
      } else {
        await BaiduMapModule.addHeatMap(HEATMAP_DATA, {
          radius: 20,
          opacity: 0.6,
        });
        setShowHeatMap(true);
        Alert.alert('提示', '热力图已添加');
      }
    } catch (error) {
      Logger.error('热力图操作失败', error);
      Alert.alert('热力图操作失败', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Text style={styles.backButton}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>热力图</Text>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        center={BEIJING_CENTER}
        zoom={12}
        baiduHeatMapEnabled={showHeatMap}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleHeatMap}>
          <Text style={styles.buttonText}>{showHeatMap ? '移除热力图' : '显示热力图'}</Text>
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

export default HeatMapScreen;