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

// Example custom map style JSON.
// You can generate your own style from https://lbsyun.baidu.com/index.php?title=jspopular/style
const CUSTOM_MAP_STYLE = [
  {
    "featureType": "land",
    "elementType": "geometry",
    "stylers": {
      "color": "#f5f5f5"
    }
  },
  // ... more styles
];

const CustomMapStyleScreen: React.FC<Props> = ({ onGoBack }) => {
  const mapRef = useRef<MapViewMethods>(null);
  const [isCustomStyle, setIsCustomStyle] = useState(false);

  const toggleCustomStyle = async () => {
    try {
      if (isCustomStyle) {
        await BaiduMapModule.setMapCustomStyle({ styleJson: '' });
        setIsCustomStyle(false);
        Alert.alert('提示', '已移除自定义样式');
      } else {
        await BaiduMapModule.setMapCustomStyle({ styleJson: JSON.stringify(CUSTOM_MAP_STYLE) });
        setIsCustomStyle(true);
        Alert.alert('提示', '已应用自定义样式');
      }
    } catch (error) {
      Logger.error('自定义样式操作失败', error);
      Alert.alert('自定义样式操作失败', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack}>
          <Text style={styles.backButton}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>自定义地图样式</Text>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        center={BEIJING_CENTER}
        zoom={12}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleCustomStyle}>
          <Text style={styles.buttonText}>{isCustomStyle ? '移除自定义样式' : '应用自定义样式'}</Text>
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

export default CustomMapStyleScreen;