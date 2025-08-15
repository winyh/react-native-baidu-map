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
    
    // 百度地图相关对象 - 当集成百度地图SDK后可使用
    // private BaiduMap baiduMap;
    // private InfoWindow currentInfoWindow;
    
    // 信息窗口状态管理
    private boolean isInfoWindowVisible = false;
    private long lastShowTime = 0;

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
            
            // 检查是否可以显示信息窗口
            if (!canShowInfoWindow(markerId)) {
                return;
            }
            
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
            
            // 创建增强的信息窗口视图
            View infoWindowView = createEnhancedInfoWindowView(markerInfo, options);
            if (infoWindowView == null) {
                Log.w(TAG, "Failed to create info window view");
                return;
            }
            
            // 显示百度地图信息窗口
            // 当集成百度地图SDK后，可以使用真实的信息窗口功能
            
            // 验证标记位置
            if (!isValidCoordinate(markerInfo.getLatitude(), markerInfo.getLongitude())) {
                Log.w(TAG, "Invalid marker coordinates for info window");
                return;
            }
            
            // 设置信息窗口状态
            currentInfoWindowMarkerId = markerId;
            currentInfoWindowView = infoWindowView;
            isInfoWindowVisible = true;
            lastShowTime = System.currentTimeMillis();
            
            // 模拟信息窗口显示 - 在真实环境中替换为实际的百度地图信息窗口
            Log.d(TAG, "Info window displayed at position: " + 
                  markerInfo.getLatitude() + ", " + markerInfo.getLongitude());
            
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
                
                // 隐藏百度地图信息窗口
                // 当集成百度地图SDK后，可以使用真实的信息窗口隐藏功能
                
                String hiddenMarkerId = currentInfoWindowMarkerId;
                
                // 清理信息窗口状态
                currentInfoWindowMarkerId = null;
                currentInfoWindowView = null;
                isInfoWindowVisible = false;
                
                // 发送信息窗口隐藏事件
                sendInfoWindowEvent("onInfoWindowHide", hiddenMarkerId);
                
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
     * 验证坐标有效性
     */
    private boolean isValidCoordinate(double latitude, double longitude) {
        return latitude >= -90 && latitude <= 90 && 
               longitude >= -180 && longitude <= 180;
    }
    
    /**
     * 获取信息窗口状态信息
     */
    public WritableMap getInfoWindowStatus() {
        WritableMap status = Arguments.createMap();
        status.putBoolean("isVisible", isInfoWindowVisible);
        status.putString("currentMarkerId", currentInfoWindowMarkerId);
        status.putDouble("lastShowTime", lastShowTime);
        status.putBoolean("hasView", currentInfoWindowView != null);
        return status;
    }
    
    /**
     * 设置信息窗口样式
     */
    public void setInfoWindowStyle(ReadableMap styleOptions) {
        try {
            if (styleOptions == null) {
                Log.w(TAG, "Style options is null");
                return;
            }
            
            Log.d(TAG, "Setting info window style");
            
            // 当集成百度地图SDK后，可以应用真实的样式设置
            // 目前记录样式选项用于后续应用
            
            if (styleOptions.hasKey("backgroundColor")) {
                Log.d(TAG, "Background color: " + styleOptions.getString("backgroundColor"));
            }
            
            if (styleOptions.hasKey("borderColor")) {
                Log.d(TAG, "Border color: " + styleOptions.getString("borderColor"));
            }
            
            if (styleOptions.hasKey("borderWidth")) {
                Log.d(TAG, "Border width: " + styleOptions.getInt("borderWidth"));
            }
            
            if (styleOptions.hasKey("cornerRadius")) {
                Log.d(TAG, "Corner radius: " + styleOptions.getInt("cornerRadius"));
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to set info window style", e);
        }
    }
    
    /**
     * 批量隐藏所有信息窗口
     */
    public void hideAllInfoWindows() {
        try {
            if (isInfoWindowVisible) {
                hideInfoWindow();
                Log.d(TAG, "All info windows hidden");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to hide all info windows", e);
        }
    }
    
    /**
     * 检查信息窗口是否可以显示
     */
    private boolean canShowInfoWindow(String markerId) {
        // 检查标记ID有效性
        if (markerId == null || markerId.isEmpty()) {
            Log.w(TAG, "Invalid marker ID for info window");
            return false;
        }
        
        // 检查地图视图可用性
        if (mapView == null) {
            Log.w(TAG, "Map view not available");
            return false;
        }
        
        // 检查React上下文可用性
        if (reactContext == null || reactContext.isDestroyed()) {
            Log.w(TAG, "React context not available");
            return false;
        }
        
        return true;
    }
    
    /**
     * 创建增强的信息窗口视图
     */
    private View createEnhancedInfoWindowView(MarkerInfo markerInfo, ReadableMap options) {
        try {
            Context context = reactContext.getApplicationContext();
            
            // 创建主容器
            LinearLayout container = new LinearLayout(context);
            container.setOrientation(LinearLayout.VERTICAL);
            
            // 设置默认样式
            container.setBackgroundColor(Color.WHITE);
            container.setPadding(20, 15, 20, 15);
            
            // 应用自定义样式
            if (options != null) {
                applyInfoWindowStyles(container, options);
            }
            
            // 设置容器布局参数
            LinearLayout.LayoutParams containerParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            );
            container.setLayoutParams(containerParams);
            
            // 添加内容
            addInfoWindowContent(container, markerInfo, options);
            
            // 设置交互
            setupInfoWindowInteraction(container, markerInfo);
            
            return container;
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to create enhanced info window view", e);
            return createInfoWindowView(markerInfo, options); // 回退到基础实现
        }
    }
    
    /**
     * 应用信息窗口样式
     */
    private void applyInfoWindowStyles(LinearLayout container, ReadableMap options) {
        try {
            if (options.hasKey("backgroundColor")) {
                String bgColor = options.getString("backgroundColor");
                if (bgColor != null) {
                    container.setBackgroundColor(Color.parseColor(bgColor));
                }
            }
            
            if (options.hasKey("padding")) {
                int padding = options.getInt("padding");
                container.setPadding(padding, padding, padding, padding);
            }
            
            if (options.hasKey("minWidth")) {
                int minWidth = options.getInt("minWidth");
                container.setMinimumWidth(minWidth);
            }
            
            if (options.hasKey("maxWidth")) {
                int maxWidth = options.getInt("maxWidth");
                container.setMaxWidth(maxWidth);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to apply info window styles", e);
        }
    }
    
    /**
     * 添加信息窗口内容
     */
    private void addInfoWindowContent(LinearLayout container, MarkerInfo markerInfo, ReadableMap options) {
        Context context = container.getContext();
        
        // 添加标题
        String title = getInfoWindowTitle(markerInfo, options);
        if (title != null && !title.isEmpty()) {
            TextView titleView = createTitleView(context, title, options);
            container.addView(titleView);
        }
        
        // 添加描述
        String description = getInfoWindowDescription(markerInfo, options);
        if (description != null && !description.isEmpty()) {
            TextView descriptionView = createDescriptionView(context, description, options);
            container.addView(descriptionView);
        }
        
        // 添加坐标信息（如果需要）
        if (options != null && options.hasKey("showCoordinates") && options.getBoolean("showCoordinates")) {
            TextView coordView = createCoordinateView(context, markerInfo);
            container.addView(coordView);
        }
    }
    
    /**
     * 创建标题视图
     */
    private TextView createTitleView(Context context, String title, ReadableMap options) {
        TextView titleView = new TextView(context);
        titleView.setText(title);
        titleView.setTextSize(16);
        titleView.setTextColor(Color.BLACK);
        titleView.setGravity(Gravity.CENTER);
        
        // 应用自定义标题样式
        if (options != null && options.hasKey("titleStyle")) {
            ReadableMap titleStyle = options.getMap("titleStyle");
            if (titleStyle != null) {
                if (titleStyle.hasKey("fontSize")) {
                    titleView.setTextSize(titleStyle.getInt("fontSize"));
                }
                if (titleStyle.hasKey("color")) {
                    titleView.setTextColor(Color.parseColor(titleStyle.getString("color")));
                }
            }
        }
        
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        titleParams.bottomMargin = 8;
        titleView.setLayoutParams(titleParams);
        
        return titleView;
    }
    
    /**
     * 创建描述视图
     */
    private TextView createDescriptionView(Context context, String description, ReadableMap options) {
        TextView descriptionView = new TextView(context);
        descriptionView.setText(description);
        descriptionView.setTextSize(14);
        descriptionView.setTextColor(Color.GRAY);
        descriptionView.setGravity(Gravity.CENTER);
        
        // 应用自定义描述样式
        if (options != null && options.hasKey("descriptionStyle")) {
            ReadableMap descStyle = options.getMap("descriptionStyle");
            if (descStyle != null) {
                if (descStyle.hasKey("fontSize")) {
                    descriptionView.setTextSize(descStyle.getInt("fontSize"));
                }
                if (descStyle.hasKey("color")) {
                    descriptionView.setTextColor(Color.parseColor(descStyle.getString("color")));
                }
            }
        }
        
        LinearLayout.LayoutParams descParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        descriptionView.setLayoutParams(descParams);
        
        return descriptionView;
    }
    
    /**
     * 创建坐标视图
     */
    private TextView createCoordinateView(Context context, MarkerInfo markerInfo) {
        TextView coordView = new TextView(context);
        String coordText = String.format("%.6f, %.6f", 
                                        markerInfo.getLatitude(), 
                                        markerInfo.getLongitude());
        coordView.setText(coordText);
        coordView.setTextSize(12);
        coordView.setTextColor(Color.LTGRAY);
        coordView.setGravity(Gravity.CENTER);
        
        LinearLayout.LayoutParams coordParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        coordParams.topMargin = 4;
        coordView.setLayoutParams(coordParams);
        
        return coordView;
    }
    
    /**
     * 设置信息窗口交互
     */
    private void setupInfoWindowInteraction(LinearLayout container, MarkerInfo markerInfo) {
        // 设置点击监听
        container.setOnClickListener(v -> {
            sendInfoWindowEvent("onInfoWindowPress", markerInfo.getMarkerId());
        });
        
        // 设置长按监听
        container.setOnLongClickListener(v -> {
            sendInfoWindowEvent("onInfoWindowLongPress", markerInfo.getMarkerId());
            return true;
        });
    }

    /**
     * 清理资源
     */
    public void destroy() {
        try {
            Log.d(TAG, "Destroying info window manager");
            hideInfoWindow();
            
            // 清理引用
            reactContext = null;
            mapView = null;
            currentInfoWindowView = null;
            
        } catch (Exception e) {
            Log.e(TAG, "Error destroying info window manager", e);
        }
    }
}