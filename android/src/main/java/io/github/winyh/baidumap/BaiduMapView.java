package io.github.winyh.baidumap;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import com.baidu.mapapi.map.BaiduMap;
import com.baidu.mapapi.map.MapStatus;
import com.baidu.mapapi.map.MapStatusUpdate;
import com.baidu.mapapi.map.MapStatusUpdateFactory;
import com.baidu.mapapi.map.MapView;
import com.baidu.mapapi.map.MyLocationConfiguration;
import com.baidu.mapapi.map.UiSettings;
import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.model.LatLngBounds;

public class BaiduMapView extends FrameLayout {
    private static final String TAG = "BaiduMapView";
    
    private ReactContext reactContext;
    private Handler mainHandler;
    private boolean isMapReady = false;
    private boolean isMapLoaded = false;
    
    // 百度地图相关
    private MapView mapView;
    private BaiduMap baiduMap;
    
    // 标记管理器
    private MarkerManager markerManager;
    
    // 信息窗口管理器
    private InfoWindowManager infoWindowManager;
    
    // 覆盖物管理器
    private OverlayManager overlayManager;
    
    // 地图状态
    private double centerLatitude = 39.915;
    private double centerLongitude = 116.404;
    private float zoomLevel = 12.0f;
    private float minZoomLevel = 3.0f;
    private float maxZoomLevel = 21.0f;
    private String mapType = BaiduMapConfig.MAP_TYPE_NORMAL;
    private boolean showsUserLocation = false;
    private boolean userLocationAccuracyCircleEnabled = true;
    
    // UI 控件状态
    private boolean zoomControlsEnabled = true;
    private boolean compassEnabled = false;
    private boolean scaleControlEnabled = false;
    
    // 手势控制
    private boolean rotateGesturesEnabled = true;
    private boolean scrollGesturesEnabled = true;
    private boolean zoomGesturesEnabled = true;
    private boolean overlookGesturesEnabled = true;
    
    // 图层控制
    private boolean trafficEnabled = false;
    private boolean buildingsEnabled = true;
    
    // 地图边距
    private int paddingLeft = 0;
    private int paddingTop = 0;
    private int paddingRight = 0;
    private int paddingBottom = 0;
    
    // 待执行的操作队列
    private boolean hasPendingOperations = false;

    public BaiduMapView(@NonNull Context context) {
        super(context);
        this.reactContext = (ReactContext) context;
        this.mainHandler = new Handler(Looper.getMainLooper());
        initializeMap();
    }

    private void initializeMap() {
        try {
            Log.d(TAG, "Initializing Baidu Map View");
            
            // 初始化百度地图视图
            mapView = new MapView(getContext());
            baiduMap = mapView.getMap();
            
            // 设置地图监听器
            baiduMap.setOnMapClickListener(new BaiduMap.OnMapClickListener() {
                @Override
                public void onMapClick(LatLng latLng) {
                    sendMapClickEvent(latLng.latitude, latLng.longitude);
                }
                
                @Override
                public boolean onMapPoiClick(com.baidu.mapapi.map.MapPoi mapPoi) {
                    return false;
                }
            });
            
            baiduMap.setOnMapLongClickListener(new BaiduMap.OnMapLongClickListener() {
                @Override
                public void onMapLongClick(LatLng latLng) {
                    sendMapLongClickEvent(latLng.latitude, latLng.longitude);
                }
            });
            
            baiduMap.setOnMapStatusChangeListener(new BaiduMap.OnMapStatusChangeListener() {
                @Override
                public void onMapStatusChangeStart(MapStatus mapStatus) {}
                
                @Override
                public void onMapStatusChangeStart(MapStatus mapStatus, int reason) {}
                
                @Override
                public void onMapStatusChange(MapStatus mapStatus) {}
                
                @Override
                public void onMapStatusChangeFinish(MapStatus mapStatus) {
                    centerLatitude = mapStatus.target.latitude;
                    centerLongitude = mapStatus.target.longitude;
                    zoomLevel = mapStatus.zoom;
                    sendMapStatusChangeEvent();
                }
            });
            
            baiduMap.setOnMapLoadedCallback(new BaiduMap.OnMapLoadedCallback() {
                @Override
                public void onMapLoaded() {
                    isMapLoaded = true;
                    sendMapLoadedEvent();
                }
            });
            
            // 设置默认地图状态
            LatLng center = new LatLng(centerLatitude, centerLongitude);
            MapStatusUpdate update = MapStatusUpdateFactory.newLatLngZoom(center, zoomLevel);
            baiduMap.setMapStatus(update);
            
            // 应用初始设置
            applyInitialSettings();
            
            addView(mapView);
            
            // 延迟标记地图准备就绪
            mainHandler.postDelayed(() -> {
                isMapReady = true;
                
                // 初始化管理器
                markerManager = new MarkerManager(reactContext, this);
                infoWindowManager = new InfoWindowManager(reactContext, this);
                overlayManager = new OverlayManager(reactContext, this);
                
                sendMapReadyEvent();
                
                // 执行待处理的操作
                if (hasPendingOperations) {
                    applyPendingOperations();
                    hasPendingOperations = false;
                }
            }, 100);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize map", e);
            sendMapErrorEvent("INIT_ERROR", "Failed to initialize map: " + e.getMessage());
        }
    }
    
    private void applyInitialSettings() {
        if (baiduMap == null) return;
        
        try {
            // 设置地图类型
            switch (mapType) {
                case BaiduMapConfig.MAP_TYPE_SATELLITE:
                    baiduMap.setMapType(BaiduMap.MAP_TYPE_SATELLITE);
                    break;
                case BaiduMapConfig.MAP_TYPE_HYBRID:
                    baiduMap.setMapType(BaiduMap.MAP_TYPE_HYBRID);
                    break;
                default:
                    baiduMap.setMapType(BaiduMap.MAP_TYPE_NORMAL);
                    break;
            }
            
            // 设置用户位置显示
            baiduMap.setMyLocationEnabled(showsUserLocation);
            
            // 设置定位精度圆圈
            MyLocationConfiguration config = new MyLocationConfiguration(
                MyLocationConfiguration.LocationMode.NORMAL, 
                userLocationAccuracyCircleEnabled, 
                null
            );
            baiduMap.setMyLocationConfiguration(config);
            
            // 设置UI控件
            UiSettings uiSettings = baiduMap.getUiSettings();
            uiSettings.setRotateGesturesEnabled(rotateGesturesEnabled);
            uiSettings.setScrollGesturesEnabled(scrollGesturesEnabled);
            uiSettings.setZoomGesturesEnabled(zoomGesturesEnabled);
            uiSettings.setOverlookingGesturesEnabled(overlookGesturesEnabled);
            uiSettings.setCompassEnabled(compassEnabled);
            
            // 设置地图控件
            mapView.showZoomControls(zoomControlsEnabled);
            mapView.showScaleControl(scaleControlEnabled);
            
            // 设置图层
            baiduMap.setTrafficEnabled(trafficEnabled);
            baiduMap.setBuildingsEnabled(buildingsEnabled);
            
            // 设置缩放级别限制
            baiduMap.setMaxAndMinZoomLevel(maxZoomLevel, minZoomLevel);
            
            // 设置地图边距
            if (paddingLeft != 0 || paddingTop != 0 || paddingRight != 0 || paddingBottom != 0) {
                baiduMap.setViewPadding(paddingLeft, paddingTop, paddingRight, paddingBottom);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to apply initial settings", e);
        }
    }

    public void setCenter(double latitude, double longitude) {
        this.centerLatitude = latitude;
        this.centerLongitude = longitude;
        
        if (isMapReady && baiduMap != null) {
            LatLng center = new LatLng(latitude, longitude);
            MapStatusUpdate update = MapStatusUpdateFactory.newLatLng(center);
            baiduMap.animateMapStatus(update);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setZoom(float zoom) {
        this.zoomLevel = zoom;
        
        if (isMapReady && baiduMap != null) {
            MapStatusUpdate update = MapStatusUpdateFactory.zoomTo(zoom);
            baiduMap.animateMapStatus(update);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setMapType(String mapType) {
        this.mapType = mapType;
        
        if (isMapReady && baiduMap != null) {
            switch (mapType) {
                case BaiduMapConfig.MAP_TYPE_SATELLITE:
                    baiduMap.setMapType(BaiduMap.MAP_TYPE_SATELLITE);
                    break;
                case BaiduMapConfig.MAP_TYPE_HYBRID:
                    baiduMap.setMapType(BaiduMap.MAP_TYPE_HYBRID);
                    break;
                default:
                    baiduMap.setMapType(BaiduMap.MAP_TYPE_NORMAL);
                    break;
            }
        } else {
            hasPendingOperations = true;
        }
    }

    public void setShowsUserLocation(boolean showsUserLocation) {
        this.showsUserLocation = showsUserLocation;
        
        if (isMapReady && baiduMap != null) {
            baiduMap.setMyLocationEnabled(showsUserLocation);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setUserLocationAccuracyCircleEnabled(boolean enabled) {
        this.userLocationAccuracyCircleEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            MyLocationConfiguration config = new MyLocationConfiguration(
                MyLocationConfiguration.LocationMode.NORMAL, enabled, null);
            baiduMap.setMyLocationConfiguration(config);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setZoomControlsEnabled(boolean enabled) {
        this.zoomControlsEnabled = enabled;
        
        if (isMapReady && mapView != null) {
            mapView.showZoomControls(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setCompassEnabled(boolean enabled) {
        this.compassEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            UiSettings uiSettings = baiduMap.getUiSettings();
            uiSettings.setCompassEnabled(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setScaleControlEnabled(boolean enabled) {
        this.scaleControlEnabled = enabled;
        
        if (isMapReady && mapView != null) {
            mapView.showScaleControl(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setRotateGesturesEnabled(boolean enabled) {
        this.rotateGesturesEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            UiSettings uiSettings = baiduMap.getUiSettings();
            uiSettings.setRotateGesturesEnabled(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setScrollGesturesEnabled(boolean enabled) {
        this.scrollGesturesEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            UiSettings uiSettings = baiduMap.getUiSettings();
            uiSettings.setScrollGesturesEnabled(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setZoomGesturesEnabled(boolean enabled) {
        this.zoomGesturesEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            UiSettings uiSettings = baiduMap.getUiSettings();
            uiSettings.setZoomGesturesEnabled(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setOverlookGesturesEnabled(boolean enabled) {
        this.overlookGesturesEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            UiSettings uiSettings = baiduMap.getUiSettings();
            uiSettings.setOverlookingGesturesEnabled(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setTrafficEnabled(boolean enabled) {
        this.trafficEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            baiduMap.setTrafficEnabled(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setBuildingsEnabled(boolean enabled) {
        this.buildingsEnabled = enabled;
        
        if (isMapReady && baiduMap != null) {
            baiduMap.setBuildingsEnabled(enabled);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setMapPadding(int left, int top, int right, int bottom) {
        this.paddingLeft = left;
        this.paddingTop = top;
        this.paddingRight = right;
        this.paddingBottom = bottom;
        
        if (isMapReady && baiduMap != null) {
            baiduMap.setViewPadding(left, top, right, bottom);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setMinZoomLevel(float minZoom) {
        this.minZoomLevel = Math.max(3.0f, Math.min(21.0f, minZoom));
        
        if (isMapReady && baiduMap != null) {
            baiduMap.setMaxAndMinZoomLevel(maxZoomLevel, this.minZoomLevel);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setMaxZoomLevel(float maxZoom) {
        this.maxZoomLevel = Math.max(3.0f, Math.min(21.0f, maxZoom));
        
        if (isMapReady && baiduMap != null) {
            baiduMap.setMaxAndMinZoomLevel(this.maxZoomLevel, minZoomLevel);
        } else {
            hasPendingOperations = true;
        }
    }

    public void setRegion(double latitude, double longitude, double latitudeDelta, double longitudeDelta) {
        this.centerLatitude = latitude;
        this.centerLongitude = longitude;
        
        if (isMapReady && baiduMap != null) {
            LatLng southwest = new LatLng(latitude - latitudeDelta/2, longitude - longitudeDelta/2);
            LatLng northeast = new LatLng(latitude + latitudeDelta/2, longitude + longitudeDelta/2);
            LatLngBounds bounds = new LatLngBounds.Builder().include(southwest).include(northeast).build();
            MapStatusUpdate update = MapStatusUpdateFactory.newLatLngBounds(bounds);
            baiduMap.animateMapStatus(update);
        } else {
            hasPendingOperations = true;
        }
    }

    private void sendMapReadyEvent() {
        WritableMap event = Arguments.createMap();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onMapReady", event);
    }

    private void sendMapClickEvent(double latitude, double longitude) {
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        
        WritableMap event = Arguments.createMap();
        event.putMap("coordinate", coordinate);
        
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onMapClick", event);
    }

    private void sendMapLongClickEvent(double latitude, double longitude) {
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        
        WritableMap event = Arguments.createMap();
        event.putMap("coordinate", coordinate);
        
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onMapLongClick", event);
    }

    private void sendMapStatusChangeEvent() {
        WritableMap center = Arguments.createMap();
        center.putDouble("latitude", centerLatitude);
        center.putDouble("longitude", centerLongitude);
        
        WritableMap event = Arguments.createMap();
        event.putMap("center", center);
        event.putDouble("zoom", zoomLevel);
        event.putDouble("overlook", 0);
        event.putDouble("rotation", 0);
        
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onMapStatusChange", event);
    }

    private void sendMapLoadedEvent() {
        WritableMap event = Arguments.createMap();
        event.putBoolean("loaded", true);
        
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onMapLoaded", event);
    }

    private void sendMapErrorEvent(String errorCode, String errorMessage) {
        WritableMap event = Arguments.createMap();
        event.putString("code", errorCode);
        event.putString("message", errorMessage);
        
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onMapError", event);
    }

    private void sendUserLocationUpdateEvent(double latitude, double longitude, double accuracy) {
        WritableMap location = Arguments.createMap();
        location.putDouble("latitude", latitude);
        location.putDouble("longitude", longitude);
        location.putDouble("accuracy", accuracy);
        location.putDouble("timestamp", System.currentTimeMillis());
        
        WritableMap event = Arguments.createMap();
        event.putMap("location", location);
        
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "onUserLocationUpdate", event);
    }

    /**
     * 在属性更新后执行待处理的操作
     */
    public void onAfterUpdateTransaction() {
        if (hasPendingOperations && isMapReady) {
            // 执行待处理的操作
            applyPendingOperations();
            hasPendingOperations = false;
        }
    }

    private void applyPendingOperations() {
        // 应用所有待处理的地图设置
        Log.d(TAG, "Applying pending operations");
        
        if (baiduMap == null) return;
        
        try {
            // 设置中心点和缩放级别
            LatLng center = new LatLng(centerLatitude, centerLongitude);
            MapStatusUpdate update = MapStatusUpdateFactory.newLatLngZoom(center, zoomLevel);
            baiduMap.animateMapStatus(update);
            
            // 重新应用所有设置
            applyInitialSettings();
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to apply pending operations", e);
        }
    }

    /**
     * 地图生命周期管理
     */
    public void onResume() {
        if (mapView != null) {
            mapView.onResume();
        }
    }

    public void onPause() {
        if (mapView != null) {
            mapView.onPause();
        }
    }

    /**
     * 标记管理方法
     */
    public String addMarker(ReadableMap markerOptions) {
        if (markerManager != null) {
            return markerManager.addMarker(markerOptions);
        }
        return null;
    }

    public boolean updateMarker(String markerId, ReadableMap markerOptions) {
        if (markerManager != null) {
            return markerManager.updateMarker(markerId, markerOptions);
        }
        return false;
    }

    public boolean removeMarker(String markerId) {
        if (markerManager != null) {
            return markerManager.removeMarker(markerId);
        }
        return false;
    }

    public void removeAllMarkers() {
        if (markerManager != null) {
            markerManager.removeAllMarkers();
        }
    }

    public void showInfoWindow(String markerId) {
        showInfoWindow(markerId, null);
    }

    public void showInfoWindow(String markerId, ReadableMap options) {
        if (infoWindowManager != null) {
            infoWindowManager.showInfoWindow(markerId, options);
        }
    }

    public void hideInfoWindow() {
        if (infoWindowManager != null) {
            infoWindowManager.hideInfoWindow();
        }
    }

    public void updateInfoWindow(String markerId, ReadableMap options) {
        if (infoWindowManager != null) {
            infoWindowManager.updateInfoWindow(markerId, options);
        }
    }

    public MarkerManager getMarkerManager() {
        return markerManager;
    }

    public InfoWindowManager getInfoWindowManager() {
        return infoWindowManager;
    }

    /**
     * 覆盖物管理方法
     */
    public String addPolyline(ReadableMap polylineOptions) {
        if (overlayManager != null) {
            return overlayManager.addPolyline(polylineOptions);
        }
        return null;
    }

    public String addPolygon(ReadableMap polygonOptions) {
        if (overlayManager != null) {
            return overlayManager.addPolygon(polygonOptions);
        }
        return null;
    }

    public String addCircle(ReadableMap circleOptions) {
        if (overlayManager != null) {
            return overlayManager.addCircle(circleOptions);
        }
        return null;
    }

    public boolean updateOverlay(String overlayId, ReadableMap options) {
        if (overlayManager != null) {
            return overlayManager.updateOverlay(overlayId, options);
        }
        return false;
    }

    public boolean removeOverlay(String overlayId) {
        if (overlayManager != null) {
            return overlayManager.removeOverlay(overlayId);
        }
        return false;
    }

    public void removeAllOverlays() {
        if (overlayManager != null) {
            overlayManager.removeAllOverlays();
        }
    }

    public OverlayManager getOverlayManager() {
        return overlayManager;
    }

    public void onDestroy() {
        Log.d(TAG, "Destroying map view");
        
        try {
            // 清理覆盖物管理器
            if (overlayManager != null) {
                overlayManager.destroy();
                overlayManager = null;
            }
            
            // 清理信息窗口管理器
            if (infoWindowManager != null) {
                infoWindowManager.destroy();
                infoWindowManager = null;
            }
            
            // 清理标记管理器
            if (markerManager != null) {
                markerManager.destroy();
                markerManager = null;
            }
            
            // 清理资源
            if (mainHandler != null) {
                mainHandler.removeCallbacksAndMessages(null);
            }
            
            // 清理地图资源
            if (baiduMap != null) {
                baiduMap.setMyLocationEnabled(false);
                baiduMap = null;
            }
            
            if (mapView != null) {
                mapView.onDestroy();
                mapView = null;
            }
            
            isMapReady = false;
            isMapLoaded = false;
            
        } catch (Exception e) {
            Log.e(TAG, "Error destroying map view", e);
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        onDestroy();
    }
}