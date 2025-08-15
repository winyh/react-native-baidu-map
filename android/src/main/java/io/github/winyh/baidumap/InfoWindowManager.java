package io.github.winyh.baidumap;

import android.content.Context;
import android.graphics.Color;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class InfoWindowManager {
    private static final String TAG = "BaiduInfoWindowManager";
    
    private ReactContext reactContext;
    private BaiduMapView mapView;
    
    // 当前显示的信息窗口
    private String currentInfoWindowMarkerId;
    private View currentInfoWindowView;
    
    // TODO: 百度地图相关对象
    // private BaiduMap baiduMap;
    // private InfoWindow currentInfoWindow;

    public InfoWindowManager(ReactContext reactContext, BaiduMapView mapView) {
        this.reactContext = reactContext;
        this.mapView = mapView;
        // this.baiduMap = mapView.getBaiduMap();
    }

    /**
     * 显示信息窗口
     */
    public void showInfoWindow(String markerId, ReadableMap options) {
        try {
            Log.d(TAG, "Showing info window for marker: " + markerId);
            
            // 获取标记信息
            MarkerManager markerManager = mapView.getMarkerManager();
            if (markerManager == null) {
                Log.w(TAG, "Marker manager not available");
                return;
            }
            
            MarkerInfo markerInfo = markerManager.getMarkerInfo(markerId);
            if (markerInfo == null) {
                Log.w(TAG, "Marker not found: " + markerId);
                return;
            }
            
            // 隐藏当前信息窗口
            hideInfoWindow();
            
            // 创建信息窗口视图
            View infoWindowView = createInfoWindowView(markerInfo, options);
            if (infoWindowView == null) {
                Log.w(TAG, "Failed to create info window view");
                return;
            }
            
            // TODO: 显示百度地图信息窗口
            // 当百度地图 SDK 集成后，取消注释以下代码：
            /*
            LatLng position = new LatLng(markerInfo.getLatitude(), markerInfo.getLongitude());
            
            InfoWindow infoWindow = new InfoWindow(
                infoWindowView,
                position,
                getInfoWindowYOffset(options)
            );
            
            baiduMap.showInfoWindow(infoWindow);
            currentInfoWindow = infoWindow;
            */
            
            currentInfoWindowMarkerId = markerId;
            currentInfoWindowView = infoWindowView;
            
            // 发送信息窗口显示事件
            sendInfoWindowEvent("onInfoWindowShow", markerId);
            
            Log.d(TAG, "Info window shown for marker: " + markerId);
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to show info window for marker: " + markerId, e);
        }
    }

    /**
     * 隐藏信息窗口
     */
    public void hideInfoWindow() {
        try {
            if (currentInfoWindowMarkerId != null) {
                Log.d(TAG, "Hiding info window for marker: " + currentInfoWindowMarkerId);
                
                // TODO: 隐藏百度地图信息窗口
                // 当百度地图 SDK 集成后，取消注释以下代码：
                /*
                if (currentInfoWindow != null) {
                    baiduMap.hideInfoWindow();
                    currentInfoWindow = null;
                }
                */
                
                // 发送信息窗口隐藏事件
                sendInfoWindowEvent("onInfoWindowHide", currentInfoWindowMarkerId);
                
                currentInfoWindowMarkerId = null;
                currentInfoWindowView = null;
                
                Log.d(TAG, "Info window hidden");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to hide info window", e);
        }
    }

    /**
     * 更新信息窗口
     */
    public void updateInfoWindow(String markerId, ReadableMap options) {
        if (currentInfoWindowMarkerId != null && currentInfoWindowMarkerId.equals(markerId)) {
            // 重新显示信息窗口
            showInfoWindow(markerId, options);
        }
    }

    /**
     * 创建信息窗口视图
     */
    private View createInfoWindowView(MarkerInfo markerInfo, ReadableMap options) {
        try {
            Context context = reactContext.getApplicationContext();
            
            // 创建主容器
            LinearLayout container = new LinearLayout(context);
            container.setOrientation(LinearLayout.VERTICAL);
            container.setBackgroundColor(Color.WHITE);
            container.setPadding(20, 15, 20, 15);
            
            // 设置容器样式
            LinearLayout.LayoutParams containerParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            container.setLayoutParams(containerParams);
            
            // 添加标题
            String title = getInfoWindowTitle(markerInfo, options);
            if (title != null && !title.isEmpty()) {
                TextView titleView = new TextView(context);
                titleView.setText(title);
                titleView.setTextSize(16);
                titleView.setTextColor(Color.BLACK);
                titleView.setGravity(Gravity.CENTER);
                
                LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                );
                titleParams.bottomMargin = 8;
                titleView.setLayoutParams(titleParams);
                
                container.addView(titleView);
            }
            
            // 添加描述
            String description = getInfoWindowDescription(markerInfo, options);
            if (description != null && !description.isEmpty()) {
                TextView descriptionView = new TextView(context);
                descriptionView.setText(description);
                descriptionView.setTextSize(14);
                descriptionView.setTextColor(Color.GRAY);
                descriptionView.setGravity(Gravity.CENTER);
                
                LinearLayout.LayoutParams descParams = new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                );
                descriptionView.setLayoutParams(descParams);
                
                container.addView(descriptionView);
            }
            
            // 设置点击监听
            container.setOnClickListener(v -> {
                sendInfoWindowEvent("onInfoWindowPress", markerInfo.getMarkerId());
            });
            
            return container;
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to create info window view", e);
            return null;
        }
    }

    /**
     * 获取信息窗口标题
     */
    private String getInfoWindowTitle(MarkerInfo markerInfo, ReadableMap options) {
        if (options != null && options.hasKey("title")) {
            return options.getString("title");
        }
        return markerInfo.getTitle();
    }

    /**
     * 获取信息窗口描述
     */
    private String getInfoWindowDescription(MarkerInfo markerInfo, ReadableMap options) {
        if (options != null && options.hasKey("description")) {
            return options.getString("description");
        }
        return markerInfo.getDescription();
    }

    /**
     * 获取信息窗口Y轴偏移
     */
    private int getInfoWindowYOffset(ReadableMap options) {
        if (options != null && options.hasKey("yOffset")) {
            return options.getInt("yOffset");
        }
        return -47; // 默认偏移量
    }

    /**
     * 发送信息窗口事件
     */
    private void sendInfoWindowEvent(String eventName, String markerId) {
        try {
            WritableMap event = Arguments.createMap();
            event.putString("markerId", markerId);
            
            reactContext.getJSModule(RCTEventEmitter.class)
                .receiveEvent(mapView.getId(), eventName, event);
                
        } catch (Exception e) {
            Log.e(TAG, "Failed to send info window event: " + eventName, e);
        }
    }

    /**
     * 获取当前显示的信息窗口标记ID
     */
    public String getCurrentInfoWindowMarkerId() {
        return currentInfoWindowMarkerId;
    }

    /**
     * 检查是否有信息窗口正在显示
     */
    public boolean isInfoWindowShowing() {
        return currentInfoWindowMarkerId != null;
    }

    /**
     * 检查指定标记的信息窗口是否正在显示
     */
    public boolean isInfoWindowShowing(String markerId) {
        return currentInfoWindowMarkerId != null && currentInfoWindowMarkerId.equals(markerId);
    }

    /**
     * 清理资源
     */
    public void destroy() {
        try {
            Log.d(TAG, "Destroying info window manager");
            hideInfoWindow();
        } catch (Exception e) {
            Log.e(TAG, "Error destroying info window manager", e);
        }
    }
}