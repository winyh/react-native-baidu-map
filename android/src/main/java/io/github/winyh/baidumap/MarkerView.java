package io.github.winyh.baidumap;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class MarkerView extends View {
    private static final String TAG = "BaiduMarkerView";
    
    private ReactContext reactContext;
    private String markerId;
    private BaiduMapView parentMapView;
    
    // 标记属性
    private double latitude = 0.0;
    private double longitude = 0.0;
    private String title;
    private String description;
    private String iconUri;
    private boolean draggable = false;
    private boolean visible = true;
    private float alpha = 1.0f;
    private float rotation = 0.0f;
    private boolean flat = false;
    private int zIndex = 0;
    
    // 状态标记
    private boolean needsUpdate = false;
    private boolean isAddedToMap = false;

    public MarkerView(@NonNull Context context) {
        super(context);
        this.reactContext = (ReactContext) context;
        setVisibility(GONE); // 标记视图本身不可见
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        findParentMapView();
        addToMap();
    }

    @Override
    protected void onDetachedFromWindow() {
        removeFromMap();
        super.onDetachedFromWindow();
    }

    /**
     * 查找父级地图视图
     */
    private void findParentMapView() {
        ViewGroup parent = (ViewGroup) getParent();
        while (parent != null) {
            if (parent instanceof BaiduMapView) {
                parentMapView = (BaiduMapView) parent;
                break;
            }
            if (parent.getParent() instanceof ViewGroup) {
                parent = (ViewGroup) parent.getParent();
            } else {
                break;
            }
        }
        
        if (parentMapView == null) {
            Log.w(TAG, "Could not find parent BaiduMapView");
        }
    }

    /**
     * 添加到地图
     */
    private void addToMap() {
        if (parentMapView != null && !isAddedToMap) {
            try {
                ReadableMap markerOptions = createMarkerOptions();
                markerId = parentMapView.addMarker(markerOptions);
                
                if (markerId != null) {
                    isAddedToMap = true;
                    Log.d(TAG, "Marker added to map: " + markerId);
                } else {
                    Log.e(TAG, "Failed to add marker to map");
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error adding marker to map", e);
            }
        }
    }

    /**
     * 从地图移除
     */
    private void removeFromMap() {
        if (parentMapView != null && isAddedToMap && markerId != null) {
            try {
                boolean removed = parentMapView.removeMarker(markerId);
                if (removed) {
                    isAddedToMap = false;
                    Log.d(TAG, "Marker removed from map: " + markerId);
                } else {
                    Log.w(TAG, "Failed to remove marker from map: " + markerId);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error removing marker from map", e);
            }
        }
    }

    /**
     * 更新地图上的标记
     */
    private void updateOnMap() {
        if (parentMapView != null && isAddedToMap && markerId != null) {
            try {
                ReadableMap markerOptions = createMarkerOptions();
                boolean updated = parentMapView.updateMarker(markerId, markerOptions);
                
                if (updated) {
                    Log.d(TAG, "Marker updated on map: " + markerId);
                } else {
                    Log.w(TAG, "Failed to update marker on map: " + markerId);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error updating marker on map", e);
            }
        }
    }

    /**
     * 创建标记选项
     */
    private ReadableMap createMarkerOptions() {
        WritableMap options = Arguments.createMap();
        
        // 坐标
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        options.putMap("coordinate", coordinate);
        
        // 其他属性
        if (title != null) {
            options.putString("title", title);
        }
        if (description != null) {
            options.putString("description", description);
        }
        if (iconUri != null) {
            options.putString("icon", iconUri);
        }
        
        options.putBoolean("draggable", draggable);
        options.putBoolean("visible", visible);
        options.putDouble("alpha", alpha);
        options.putDouble("rotation", rotation);
        options.putBoolean("flat", flat);
        options.putInt("zIndex", zIndex);
        
        return options;
    }

    /**
     * 属性更新后的处理
     */
    public void onAfterUpdateTransaction() {
        if (needsUpdate) {
            updateOnMap();
            needsUpdate = false;
        }
    }

    // 属性设置方法
    public void setCoordinate(double latitude, double longitude) {
        if (this.latitude != latitude || this.longitude != longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
            needsUpdate = true;
        }
    }

    public void setTitle(String title) {
        if (!equals(this.title, title)) {
            this.title = title;
            needsUpdate = true;
        }
    }

    public void setDescription(String description) {
        if (!equals(this.description, description)) {
            this.description = description;
            needsUpdate = true;
        }
    }

    public void setIcon(String iconUri) {
        if (!equals(this.iconUri, iconUri)) {
            this.iconUri = iconUri;
            needsUpdate = true;
        }
    }

    public void setDraggable(boolean draggable) {
        if (this.draggable != draggable) {
            this.draggable = draggable;
            needsUpdate = true;
        }
    }

    public void setVisible(boolean visible) {
        if (this.visible != visible) {
            this.visible = visible;
            needsUpdate = true;
        }
    }

    public void setAlpha(float alpha) {
        alpha = Math.max(0.0f, Math.min(1.0f, alpha));
        if (this.alpha != alpha) {
            this.alpha = alpha;
            needsUpdate = true;
        }
    }

    public void setRotation(float rotation) {
        if (this.rotation != rotation) {
            this.rotation = rotation;
            needsUpdate = true;
        }
    }

    public void setFlat(boolean flat) {
        if (this.flat != flat) {
            this.flat = flat;
            needsUpdate = true;
        }
    }

    public void setZIndex(int zIndex) {
        if (this.zIndex != zIndex) {
            this.zIndex = zIndex;
            needsUpdate = true;
        }
    }

    // 事件发送方法
    private void sendPressEvent() {
        WritableMap event = Arguments.createMap();
        event.putString("markerId", markerId);
        
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", latitude);
        coordinate.putDouble("longitude", longitude);
        event.putMap("coordinate", coordinate);
        
        reactContext.getJSModule(RCTEventEmitter.class)
            .receiveEvent(getId(), "onPress", event);
    }

    private void sendDragEvent(String eventType, double lat, double lng) {
        WritableMap event = Arguments.createMap();
        event.putString("markerId", markerId);
        
        WritableMap coordinate = Arguments.createMap();
        coordinate.putDouble("latitude", lat);
        coordinate.putDouble("longitude", lng);
        event.putMap("coordinate", coordinate);
        
        reactContext.getJSModule(RCTEventEmitter.class)
            .receiveEvent(getId(), eventType, event);
    }

    // 工具方法
    private boolean equals(Object a, Object b) {
        return (a == null) ? (b == null) : a.equals(b);
    }

    // Getters
    public String getMarkerId() {
        return markerId;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getIconUri() {
        return iconUri;
    }

    public boolean isDraggable() {
        return draggable;
    }

    public boolean isVisible() {
        return visible;
    }

    public float getAlpha() {
        return alpha;
    }

    public float getRotation() {
        return rotation;
    }

    public boolean isFlat() {
        return flat;
    }

    public int getZIndex() {
        return zIndex;
    }

    public void onDestroy() {
        Log.d(TAG, "Destroying marker view: " + markerId);
        removeFromMap();
    }
}