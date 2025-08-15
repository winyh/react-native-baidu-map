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
  Polyline,
  Polygon,
  InfoWindow,
  BaiduMapModule,
  MapType,
  LocationMode,
  CoordinateType,
  LatLng,
  MarkerDragEvent,
} from '@react-native/winyh-baidu-map';

const BEIJING_CENTER: LatLng = {
  latitude: 39.915,
  longitude: 116.404,
};

// 示例标记数据
const SAMPLE_MARKERS = [
  {
    id: 1,
    coordinate: { latitude: 39.915, longitude: 116.404 },
    title: '天安门',
    description: '北京市中心，中华人民共和国的象征',
    draggable: false,
  },
  {
    id: 2,
    coordinate: { latitude: 39.916, longitude: 116.397 },
    title: '故宫',
    description: '明清两代的皇家宫殿，世界文化遗产',
    draggable: true,
  },
  {
    id: 3,
    coordinate: { latitude: 39.928, longitude: 116.388 },
    title: '景山公园',
    description: '俯瞰紫禁城的最佳地点',
    draggable: true,
  },
];

// 示例路线数据
const SAMPLE_ROUTES = [
  {
    name: '长安街',
    coordinates: [
      { latitude: 39.915, longitude: 116.404 },
      { latitude: 39.915, longitude: 116.397 },
      { latitude: 39.915, longitude: 116.388 },
      { latitude: 39.915, longitude: 116.380 },
    ],
    color: '#FF0000',
    width: 5,
  },
  {
    name: '二环路段',
    coordinates: [
      { latitude: 39.920, longitude: 116.400 },
      { latitude: 39.925, longitude: 116.405 },
      { latitude: 39.930, longitude: 116.410 },
      { latitude: 39.935, longitude: 116.415 },
    ],
    color: '#00FF00',
    width: 3,
  },
];

// 示例区域数据
const SAMPLE_AREAS = [
  {
    name: '紫禁城区域',
    coordinates: [
      { latitude: 39.913, longitude: 116.395 },
      { latitude: 39.918, longitude: 116.395 },
      { latitude: 39.918, longitude: 116.405 },
      { latitude: 39.913, longitude: 116.405 },
    ],
    strokeColor: '#0000FF',
    fillColor: '#0000FF30',
  },
  {
    name: '天安门广场',
    coordinates: [
      { latitude: 39.910, longitude: 116.400 },
      { latitude: 39.915, longitude: 116.400 },
      { latitude: 39.915, longitude: 116.408 },
      { latitude: 39.910, longitude: 116.408 },
    ],
    strokeColor: '#FF00FF',
    fillColor: '#FF00FF20',
  },
];

const MarkersExample: React.FC = () => {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [markers, setMarkers] = useState(SAMPLE_MARKERS);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showAreas, setShowAreas] = useState(false);
  const [draggedMarker, setDraggedMarker] = useState<{ id: number; coordinate: LatLng } | null>(null);

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      await BaiduMapModule.setAgreePrivacy(true);
      
      const result = await BaiduMapModule.initialize({
        apiKey: 'YOUR_API_KEY_HERE',
        enableLocation: false,
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

  const handleMarkerPress = (markerId: number) => {
    console.log('标记点击:', markerId);
    setSelectedMarkerId(selectedMarkerId === markerId ? null : markerId);
  };

  const handleMarkerDragStart = (markerId: number, event: MarkerDragEvent) => {
    console.log('标记开始拖拽:', markerId, event);
    setDraggedMarker({ id: markerId, coordinate: event.coordinate });
  };

  const handleMarkerDrag = (markerId: number, event: MarkerDragEvent) => {
    console.log('标记拖拽中:', markerId, event);
    setDraggedMarker({ id: markerId, coordinate: event.coordinate });
  };

  const handleMarkerDragEnd = (markerId: number, event: MarkerDragEvent) => {
    console.log('标记拖拽结束:', markerId, event);
    
    // 更新标记位置
    setMarkers(prevMarkers => 
      prevMarkers.map(marker => 
        marker.id === markerId 
          ? { ...marker, coordinate: event.coordinate }
          : marker
      )
    );
    
    setDraggedMarker(null);
    
    const marker = markers.find(m => m.id === markerId);
    Alert.alert(
      '标记移动',
      `${marker?.title} 已移动到新位置\n纬度: ${event.coordinate.latitude.toFixed(6)}\n经度: ${event.coordinate.longitude.toFixed(6)}`
    );
  };

  const addRandomMarker = () => {
    const newId = Math.max(...markers.map(m => m.id)) + 1;
    const randomLat = BEIJING_CENTER.latitude + (Math.random() - 0.5) * 0.02;
    const randomLng = BEIJING_CENTER.longitude + (Math.random() - 0.5) * 0.02;
    
    const newMarker = {
      id: newId,
      coordinate: { latitude: randomLat, longitude: randomLng },
      title: `标记 ${newId}`,
      description: `随机生成的标记点 ${newId}`,
      draggable: true,
    };
    
    setMarkers(prev => [...prev, newMarker]);
    Alert.alert('提示', `已添加新标记: ${newMarker.title}`);
  };

  const removeLastMarker = () => {
    if (markers.length <= SAMPLE_MARKERS.length) {
      Alert.alert('提示', '不能删除示例标记');
      return;
    }
    
    const removedMarker = markers[markers.length - 1];
    setMarkers(prev => prev.slice(0, -1));
    Alert.alert('提示', `已删除标记: ${removedMarker.title}`);
  };

  const resetMarkers = () => {
    setMarkers(SAMPLE_MARKERS);
    setSelectedMarkerId(null);
    Alert.alert('提示', '已重置为默认标记');
  };

  const handleMapClick = (event: any) => {
    console.log('地图点击:', event);
    setSelectedMarkerId(null);
  };

  const renderControlButtons = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlContainer}>
      <TouchableOpacity style={styles.button} onPress={addRandomMarker}>
        <Text style={styles.buttonText}>添加标记</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={removeLastMarker}>
        <Text style={styles.buttonText}>删除标记</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={resetMarkers}>
        <Text style={styles.buttonText}>重置标记</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, showRoutes && styles.activeButton]} 
        onPress={() => setShowRoutes(!showRoutes)}
      >
        <Text style={styles.buttonText}>显示路线</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, showAreas && styles.activeButton]} 
        onPress={() => setShowAreas(!showAreas)}
      >
        <Text style={styles.buttonText}>显示区域</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMarkerInfo = () => {
    const selectedMarker = markers.find(m => m.id === selectedMarkerId);
    if (!selectedMarker) return null;

    return (
      <View style={styles.markerInfo}>
        <Text style={styles.markerTitle}>{selectedMarker.title}</Text>
        <Text style={styles.markerDescription}>{selectedMarker.description}</Text>
        <Text style={styles.markerCoordinate}>
          坐标: {selectedMarker.coordinate.latitude.toFixed(6)}, {selectedMarker.coordinate.longitude.toFixed(6)}
        </Text>
        <Text style={styles.markerDraggable}>
          {selectedMarker.draggable ? '可拖拽' : '不可拖拽'}
        </Text>
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
        <Text style={styles.title}>标记和覆盖物示例</Text>
        <Text style={styles.subtitle}>标记数量: {markers.length}</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          center={BEIJING_CENTER}
          zoom={14}
          mapType={MapType.NORMAL}
          showsUserLocation={false}
          showsCompass={true}
          showsScale={true}
          zoomControlsEnabled={true}
          onMapClick={handleMapClick}
        >
          {/* 渲染标记 */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              draggable={marker.draggable}
              onPress={() => handleMarkerPress(marker.id)}
              onDragStart={(event) => handleMarkerDragStart(marker.id, event)}
              onDrag={(event) => handleMarkerDrag(marker.id, event)}
              onDragEnd={(event) => handleMarkerDragEnd(marker.id, event)}
            >
              {selectedMarkerId === marker.id && (
                <InfoWindow coordinate={marker.coordinate}>
                  <View style={styles.infoWindow}>
                    <Text style={styles.infoTitle}>{marker.title}</Text>
                    <Text style={styles.infoDescription}>{marker.description}</Text>
                    <Text style={styles.infoCoordinate}>
                      {marker.coordinate.latitude.toFixed(4)}, {marker.coordinate.longitude.toFixed(4)}
                    </Text>
                  </View>
                </InfoWindow>
              )}
            </Marker>
          ))}

          {/* 渲染路线 */}
          {showRoutes && SAMPLE_ROUTES.map((route, index) => (
            <Polyline
              key={`route-${index}`}
              coordinates={route.coordinates}
              color={route.color}
              width={route.width}
            />
          ))}

          {/* 渲染区域 */}
          {showAreas && SAMPLE_AREAS.map((area, index) => (
            <Polygon
              key={`area-${index}`}
              coordinates={area.coordinates}
              strokeColor={area.strokeColor}
              strokeWidth={2}
              fillColor={area.fillColor}
            />
          ))}
        </MapView>
      </View>

      {renderControlButtons()}
      {renderMarkerInfo()}
      
      {draggedMarker && (
        <View style={styles.dragInfo}>
          <Text style={styles.dragText}>
            正在拖拽标记 {draggedMarker.id}: {draggedMarker.coordinate.latitude.toFixed(4)}, {draggedMarker.coordinate.longitude.toFixed(4)}
          </Text>
        </View>
      )}
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
    fontSize: 14,
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
  markerInfo: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  markerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  markerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  markerCoordinate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  markerDraggable: {
    fontSize: 12,
    color: '#007AFF',
  },
  infoWindow: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  infoDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  infoCoordinate: {
    fontSize: 10,
    color: '#999',
  },
  dragInfo: {
    position: 'absolute',
    top: 100,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  dragText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default MarkersExample;