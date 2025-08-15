package io.github.winyh.baidumap.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class EventDispatcher {
    
    // 事件名称常量
    public static final String EVENT_LOCATION_UPDATE = "BaiduMap_LocationUpdate";
    public static final String EVENT_LOCATION_ERROR = "BaiduMap_LocationError";
    public static final String EVENT_MAP_READY = "BaiduMap_MapReady";
    public static final String EVENT_MAP_CLICK = "BaiduMap_MapClick";
    public static final String EVENT_MAP_LONG_CLICK = "BaiduMap_MapLongClick";
    public static final String EVENT_MAP_STATUS_CHANGE = "BaiduMap_MapStatusChange";
    public static final String EVENT_MARKER_CLICK = "BaiduMap_MarkerClick";
    public static final String EVENT_MARKER_DRAG = "BaiduMap_MarkerDrag";

    private ReactContext reactContext;

    public EventDispatcher(ReactContext reactContext) {
        this.reactContext = reactContext;
    }

    /**
     * 发送事件到 JavaScript
     */
    public void sendEvent(String eventName, WritableMap params) {
        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    /**
     * 发送定位更新事件
     */
    public void sendLocationUpdateEvent(double latitude, double longitude, double accuracy, 
                                      String address, long timestamp) {
        WritableMap params = Arguments.createMap();
        params.putDouble("latitude", latitude);
        params.putDouble("longitude", longitude);
        params.putDouble("accuracy", accuracy);
        params.putString("address", address);
        params.putDouble("timestamp", timestamp);
        
        sendEvent(EVENT_LOCATION_UPDATE, params);
    }

    /**
     * 发送定位错误事件
     */
    public void sendLocationErrorEvent(String errorCode, String errorMessage) {
        WritableMap params = Arguments.createMap();
        params.putString("code", errorCode);
        params.putString("message", errorMessage);
        
        sendEvent(EVENT_LOCATION_ERROR, params);
    }

    /**
     * 发送地图就绪事件
     */
    public void sendMapReadyEvent() {
        WritableMap params = Arguments.createMap();
        sendEvent(EVENT_MAP_READY, params);
    }

    /**
     * 发送地图点击事件
     */
    public void sendMapClickEvent(double latitude, double longitude) {
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        
        WritableMap params = Arguments.createMap();
        params.putMap("coordinate", coordinate);
        
        sendEvent(EVENT_MAP_CLICK, params);
    }

    /**
     * 发送地图长按事件
     */
    public void sendMapLongClickEvent(double latitude, double longitude) {
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        
        WritableMap params = Arguments.createMap();
        params.putMap("coordinate", coordinate);
        
        sendEvent(EVENT_MAP_LONG_CLICK, params);
    }

    /**
     * 发送地图状态变化事件
     */
    public void sendMapStatusChangeEvent(double latitude, double longitude, float zoom, 
                                       float overlook, float rotation) {
        WritableMap center = Arguments.createMap();
        center.putDouble("latitude", latitude);
        center.putDouble("longitude", longitude);
        
        WritableMap params = Arguments.createMap();
        params.putMap("center", center);
        params.putDouble("zoom", zoom);
        params.putDouble("overlook", overlook);
        params.putDouble("rotation", rotation);
        
        sendEvent(EVENT_MAP_STATUS_CHANGE, params);
    }

    /**
     * 发送标记点击事件
     */
    public void sendMarkerClickEvent(String markerId, double latitude, double longitude) {
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        
        WritableMap params = Arguments.createMap();
        params.putString("markerId", markerId);
        params.putMap("coordinate", coordinate);
        
        sendEvent(EVENT_MARKER_CLICK, params);
    }

    /**
     * 发送标记拖拽事件
     */
    public void sendMarkerDragEvent(String markerId, double latitude, double longitude, String state) {
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        
        WritableMap params = Arguments.createMap();
        params.putString("markerId", markerId);
        params.putMap("coordinate", coordinate);
        params.putString("state", state); // "start", "drag", "end"
        
        sendEvent(EVENT_MARKER_DRAG, params);
    }
}