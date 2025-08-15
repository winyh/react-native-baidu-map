package io.github.winyh.baidumap;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import io.github.winyh.baidumap.utils.EventDispatcher;
import io.github.winyh.baidumap.utils.PermissionUtils;

public class LocationManager {
    private static final String TAG = "BaiduLocationManager";
    
    private ReactApplicationContext reactContext;
    private EventDispatcher eventDispatcher;
    private Handler mainHandler;
    
    // 定位客户端和配置
    // private LocationClient locationClient;
    // private LocationClientOption locationOption;
    
    // 定位状态
    private boolean isLocationServiceStarted = false;
    private boolean isLocationEnabled = false;
    private LocationOptions currentOptions;
    
    // 定位结果缓存
    private WritableMap lastKnownLocation = null;
    private long lastLocationTime = 0;

    public LocationManager(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        this.eventDispatcher = new EventDispatcher(reactContext);
        this.mainHandler = new Handler(Looper.getMainLooper());
        this.currentOptions = new LocationOptions();
        initializeLocationClient();
    }

    private void initializeLocationClient() {
        try {
            Log.d(TAG, "Initializing location client");
            
            // 初始化百度定位客户端
            // 当集成百度定位SDK后，可以使用真实的定位功能
            // 目前提供模拟实现，确保定位服务可用
            
            // 模拟定位客户端初始化
            Log.d(TAG, "Location client initialized in simulation mode");
            
            Log.d(TAG, "Location client initialized successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize location client", e);
        }
    }

    private void configureLocationOption() {
        // 配置定位选项
        // 当集成百度定位SDK后，可以使用真实的定位配置
        
        // 验证定位选项的有效性
        if (currentOptions == null) {
            currentOptions = new LocationOptions();
            Log.w(TAG, "Current options is null, using default options");
        }
        
        // 验证关键配置参数
        if (!BaiduMapConfig.isValidLocationMode(currentOptions.getLocationMode())) {
            currentOptions.setLocationMode(BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY);
            Log.w(TAG, "Invalid location mode, using high accuracy mode");
        }
        
        if (!BaiduMapConfig.isValidCoordType(currentOptions.getCoordinateType())) {
            currentOptions.setCoordinateType(BaiduMapConfig.COORD_TYPE_BD09LL);
            Log.w(TAG, "Invalid coordinate type, using BD09LL");
        }
        
        // 确保扫描间隔合理
        if (currentOptions.getScanSpan() < 0) {
            currentOptions.setScanSpan(BaiduMapConfig.DEFAULT_LOCATION_SCAN_SPAN);
            Log.w(TAG, "Invalid scan span, using default value");
        }
        
        // 确保超时时间合理
        if (currentOptions.getTimeout() < 1000) {
            currentOptions.setTimeout(BaiduMapConfig.DEFAULT_LOCATION_TIMEOUT);
            Log.w(TAG, "Invalid timeout, using default value");
        }
        
        Log.d(TAG, "Location options configured: " + currentOptions.toString());
    }

    /**
     * 开始定位服务
     */
    public void startLocationService(ReadableMap options) {
        try {
            if (!PermissionUtils.hasLocationPermission(reactContext)) {
                eventDispatcher.sendLocationErrorEvent(
                    BaiduMapConfig.ERROR_LOCATION_PERMISSION_DENIED,
                    "Location permission is required"
                );
                return;
            }

            // 更新配置
            if (options != null) {
                currentOptions.updateFromReadableMap(options);
            }

            Log.d(TAG, "Starting location service");
            
            // 启动定位服务
            // 配置定位选项
            configureLocationOption();
            
            // 当集成百度定位SDK后，可以使用真实的定位服务
            // 目前提供模拟实现，确保定位服务可用
            
            // 启动定位服务
            isLocationServiceStarted = true;
            isLocationEnabled = true;
            
            Log.d(TAG, "Location service started successfully");
            
            // 开始定位更新
            simulateLocationUpdates();
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to start location service", e);
            eventDispatcher.sendLocationErrorEvent(
                BaiduMapConfig.ERROR_UNKNOWN_ERROR,
                "Failed to start location service: " + e.getMessage()
            );
        }
    }

    /**
     * 停止定位服务
     */
    public void stopLocationService() {
        try {
            Log.d(TAG, "Stopping location service");
            
            // 停止定位服务
            // 当集成百度定位SDK后，可以使用真实的定位服务停止功能
            
            // 停止定位服务
            isLocationServiceStarted = false;
            isLocationEnabled = false;
            
            // 停止所有定位更新
            if (mainHandler != null) {
                mainHandler.removeCallbacksAndMessages(null);
            }
            
            Log.d(TAG, "Location service stopped successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop location service", e);
        }
    }

    /**
     * 获取单次定位
     */
    public void getCurrentLocation(ReadableMap options, LocationCallback callback) {
        try {
            if (!PermissionUtils.hasLocationPermission(reactContext)) {
                callback.onError(BaiduMapConfig.ERROR_LOCATION_PERMISSION_DENIED, 
                    "Location permission is required");
                return;
            }

            // 如果有缓存的位置且时间较新，直接返回
            if (lastKnownLocation != null && 
                (System.currentTimeMillis() - lastLocationTime) < 30000) { // 30秒内的缓存
                callback.onSuccess(lastKnownLocation);
                return;
            }

            Log.d(TAG, "Getting current location");
            
            // 获取单次定位
            // 创建单次定位配置
            LocationOptions singleOptions = LocationOptions.createSingleLocationOptions();
            if (options != null) {
                singleOptions.updateFromReadableMap(options);
                singleOptions.setScanSpan(0); // 确保是单次定位
            }
            
            // 验证单次定位配置
            if (!BaiduMapConfig.isValidLocationMode(singleOptions.getLocationMode())) {
                singleOptions.setLocationMode(BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY);
            }
            
            if (!BaiduMapConfig.isValidCoordType(singleOptions.getCoordinateType())) {
                singleOptions.setCoordinateType(BaiduMapConfig.COORD_TYPE_BD09LL);
            }
            
            Log.d(TAG, "Starting single location request with options: " + singleOptions.toString());
            
            // 当集成百度定位SDK后，可以使用真实的单次定位功能
            // 目前提供模拟实现，确保单次定位可用
            
            // 设置超时处理
            final boolean[] isCompleted = {false};
            
            // 模拟单次定位
            mainHandler.postDelayed(() -> {
                if (!isCompleted[0]) {
                    try {
                        WritableMap location = createEnhancedMockLocation();
                        
                        // 验证定位结果
                        if (isLocationResultValid(location)) {
                            isCompleted[0] = true;
                            lastKnownLocation = location;
                            lastLocationTime = System.currentTimeMillis();
                            callback.onSuccess(location);
                            
                            Log.d(TAG, "Single location request completed successfully");
                        } else {
                            isCompleted[0] = true;
                            callback.onError(BaiduMapConfig.ERROR_LOCATION_FAILED, 
                                           "Invalid location result");
                        }
                    } catch (Exception e) {
                        isCompleted[0] = true;
                        Log.e(TAG, "Error during single location request", e);
                        callback.onError(BaiduMapConfig.ERROR_UNKNOWN_ERROR, 
                                       "Location request failed: " + e.getMessage());
                    }
                }
            }, Math.min(2000, singleOptions.getTimeout() / 2)); // 模拟定位延迟
            
            // 超时处理
            mainHandler.postDelayed(() -> {
                if (!isCompleted[0]) {
                    isCompleted[0] = true;
                    callback.onError(BaiduMapConfig.ERROR_LOCATION_TIMEOUT, "Location request timeout");
                }
            }, singleOptions.getTimeout());
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to get current location", e);
            callback.onError(BaiduMapConfig.ERROR_UNKNOWN_ERROR, 
                "Failed to get location: " + e.getMessage());
        }
    }



    /**
     * 模拟定位更新
     */
    private void simulateLocationUpdates() {
        if (!isLocationServiceStarted || currentOptions == null) return;
        
        // 检查扫描间隔，如果为0则是单次定位，不需要持续更新
        if (currentOptions.getScanSpan() <= 0) {
            Log.d(TAG, "Single location mode, stopping continuous updates");
            return;
        }
        
        mainHandler.postDelayed(() -> {
            if (isLocationServiceStarted && isLocationServiceAvailable()) {
                try {
                    WritableMap location = createEnhancedMockLocation();
                    
                    // 验证定位结果
                    if (isLocationResultValid(location)) {
                        lastKnownLocation = location;
                        lastLocationTime = System.currentTimeMillis();
                        
                        // 发送定位更新事件
                        if (eventDispatcher != null) {
                            eventDispatcher.sendLocationUpdateEvent(
                                location.getDouble("latitude"),
                                location.getDouble("longitude"),
                                location.getDouble("accuracy"),
                                location.getString("address"),
                                (long) location.getDouble("timestamp")
                            );
                        }
                        
                        Log.d(TAG, "Location update sent: " + 
                              location.getDouble("latitude") + ", " + 
                              location.getDouble("longitude"));
                    } else {
                        Log.w(TAG, "Invalid location result, skipping update");
                    }
                    
                } catch (Exception e) {
                    Log.e(TAG, "Error during location update", e);
                    handleLocationError(BaiduMapConfig.ERROR_UNKNOWN_ERROR, 
                                      "Location update failed: " + e.getMessage());
                }
                
                // 继续模拟定位更新
                simulateLocationUpdates();
            }
        }, Math.max(1000, currentOptions.getScanSpan())); // 最小间隔1秒
    }

    /**
     * 创建模拟定位数据
     */
    private WritableMap createMockLocation() {
        WritableMap location = Arguments.createMap();
        
        // 模拟北京天安门附近的位置，添加一些随机偏移
        double baseLat = 39.9042;
        double baseLng = 116.4074;
        double randomLat = baseLat + (Math.random() - 0.5) * 0.01;
        double randomLng = baseLng + (Math.random() - 0.5) * 0.01;
        
        location.putDouble("latitude", randomLat);
        location.putDouble("longitude", randomLng);
        location.putDouble("accuracy", 10.0 + Math.random() * 20);
        location.putDouble("altitude", 50.0);
        location.putDouble("speed", 0.0);
        location.putDouble("heading", 0.0);
        location.putDouble("timestamp", System.currentTimeMillis());
        location.putString("address", "北京市东城区东长安街");
        location.putString("city", "北京市");
        location.putString("district", "东城区");
        location.putString("province", "北京市");
        location.putString("street", "东长安街");
        location.putString("streetNumber", "");
        location.putString("locationDescribe", "天安门附近");
        location.putString("coordType", currentOptions.getCoordinateType());
        location.putInt("locType", 61); // 模拟GPS定位成功
        
        return location;
    }

    /**
     * 获取定位状态
     */
    public boolean isLocationServiceStarted() {
        return isLocationServiceStarted;
    }

    public boolean isLocationEnabled() {
        return isLocationEnabled;
    }

    public WritableMap getLastKnownLocation() {
        return lastKnownLocation;
    }

    /**
     * 清理资源
     */
    public void destroy() {
        try {
            Log.d(TAG, "Destroying location manager");
            
            stopLocationService();
            
            // 清理定位客户端
            // 当集成百度定位SDK后，可以使用真实的定位客户端清理功能
            
            // 清理资源
            eventDispatcher = null;
            currentOptions = null;
            lastKnownLocation = null;
            
            if (mainHandler != null) {
                mainHandler.removeCallbacksAndMessages(null);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error destroying location manager", e);
        }
    }

    /**
     * 更新定位选项
     */
    public void updateLocationOptions(ReadableMap options) {
        if (options != null && currentOptions != null) {
            currentOptions.updateFromReadableMap(options);
            configureLocationOption();
            Log.d(TAG, "Location options updated");
        }
    }
    
    /**
     * 获取当前定位选项
     */
    public LocationOptions getCurrentOptions() {
        return currentOptions;
    }
    
    /**
     * 设置默认定位选项
     */
    public void setDefaultOptions(LocationOptions options) {
        if (options != null) {
            this.currentOptions = options;
            configureLocationOption();
            Log.d(TAG, "Default location options set");
        }
    }
    
    /**
     * 检查定位服务是否可用
     */
    public boolean isLocationServiceAvailable() {
        return PermissionUtils.hasLocationPermission(reactContext) && 
               reactContext != null && 
               !reactContext.isDestroyed();
    }
    
    /**
     * 获取定位状态信息
     */
    public WritableMap getLocationStatus() {
        WritableMap status = Arguments.createMap();
        status.putBoolean("serviceStarted", isLocationServiceStarted);
        status.putBoolean("locationEnabled", isLocationEnabled);
        status.putBoolean("hasPermission", PermissionUtils.hasLocationPermission(reactContext));
        status.putBoolean("hasLastKnownLocation", lastKnownLocation != null);
        status.putDouble("lastLocationTime", lastLocationTime);
        
        if (currentOptions != null) {
            status.putString("locationMode", currentOptions.getLocationMode());
            status.putString("coordinateType", currentOptions.getCoordinateType());
            status.putInt("scanSpan", currentOptions.getScanSpan());
            status.putInt("timeout", currentOptions.getTimeout());
        }
        
        return status;
    }
    
    /**
     * 验证定位结果的有效性
     */
    private boolean isLocationResultValid(WritableMap location) {
        if (location == null) return false;
        
        try {
            double lat = location.getDouble("latitude");
            double lng = location.getDouble("longitude");
            
            // 检查坐标范围
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return false;
            }
            
            // 检查精度
            if (location.hasKey("accuracy")) {
                double accuracy = location.getDouble("accuracy");
                if (accuracy < 0 || accuracy > 10000) { // 精度超过10km认为无效
                    return false;
                }
            }
            
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error validating location result", e);
            return false;
        }
    }
    
    /**
     * 处理定位错误
     */
    private void handleLocationError(String errorCode, String errorMessage) {
        Log.e(TAG, "Location error: " + errorCode + " - " + errorMessage);
        
        if (eventDispatcher != null) {
            eventDispatcher.sendLocationErrorEvent(errorCode, errorMessage);
        }
        
        // 根据错误类型进行相应处理
        switch (errorCode) {
            case BaiduMapConfig.ERROR_LOCATION_PERMISSION_DENIED:
                // 权限被拒绝，停止定位服务
                stopLocationService();
                break;
            case BaiduMapConfig.ERROR_LOCATION_TIMEOUT:
                // 定位超时，可以尝试重新定位
                Log.w(TAG, "Location timeout, service will continue");
                break;
            case BaiduMapConfig.ERROR_LOCATION_FAILED:
                // 定位失败，记录错误但继续服务
                Log.w(TAG, "Location failed, service will continue");
                break;
        }
    }
    
    /**
     * 创建增强的模拟定位数据
     */
    private WritableMap createEnhancedMockLocation() {
        WritableMap location = createMockLocation();
        
        // 添加额外的定位信息
        location.putString("provider", "simulation");
        location.putBoolean("isMockLocation", true);
        location.putString("locationMode", currentOptions.getLocationMode());
        location.putDouble("distanceFilter", currentOptions.getDistanceFilter());
        
        // 根据定位模式调整精度
        double accuracy;
        switch (currentOptions.getLocationMode()) {
            case BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY:
                accuracy = 5.0 + Math.random() * 10; // 5-15米
                break;
            case BaiduMapConfig.LOCATION_MODE_BATTERY_SAVING:
                accuracy = 50.0 + Math.random() * 100; // 50-150米
                break;
            case BaiduMapConfig.LOCATION_MODE_DEVICE_SENSORS:
                accuracy = 20.0 + Math.random() * 30; // 20-50米
                break;
            default:
                accuracy = 10.0 + Math.random() * 20; // 10-30米
        }
        location.putDouble("accuracy", accuracy);
        
        return location;
    }

    /**
     * 定位回调接口
     */
    public interface LocationCallback {
        void onSuccess(WritableMap location);
        void onError(String errorCode, String errorMessage);
    }
}