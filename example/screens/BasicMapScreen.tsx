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

interface Props {
  onGoBack: () => void;
}

const BasicMapScreen: React.FC<Props> = ({ onGoBack }) => {
  const mapRef = useRef<MapViewMethods>(null);
  const [mapType, setMapType] = useState<MapType>(MapType.NORMAL);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolyline, setShowPolyline] = useState(false);
  const [showPolygon, setShowPolygon] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

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
      const result = await mapRef.current.takeSnapshot();
      
      Logger.info('截图成功', { path: result.path });
      Alert.alert('成功', `截图已保存: ${result.path}`);
    } catch (error) {
      Logger.error('截图异常', error);
      Alert.alert('错误', '截图时发生异常');
    }
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
      <TouchableOpacity style={styles.button} onPress={onGoBack}>
        <Text style={styles.buttonText}>返回</Text>
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
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>基础地图功能</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          center={BEIJING_CENTER}
          zoom={15}
          mapType={mapType}
          onMapClick={handleMapClick}
          onMapLoaded={() => Logger.info('地图加载完成')}
        >
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

          {showPolyline && (
            <Polyline
              coordinates={SAMPLE_POLYLINE}
              color="#FF0000"
              width={5}
            />
          )}

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

export default BasicMapScreen;