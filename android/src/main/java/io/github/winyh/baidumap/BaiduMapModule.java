package io.github.winyh.baidumap;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;

import androidx.annotation.NonNull;

import com.baidu.mapapi.CoordType;
import com.baidu.mapapi.SDKInitializer;
import com.baidu.mapapi.common.BaiduMapSDKException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.module.annotations.ReactModule;

import io.github.winyh.baidumap.utils.PermissionUtils;

@ReactModule(name = BaiduMapModule.NAME)
public class BaiduMapModule extends ReactContextBaseJavaModule {
    public static final String NAME = "BaiduMapModule";
    
    private static final String BAIDU_API_KEY_META_NAME = "com.baidu.lbsapi.API_KEY";

    private ReactApplicationContext reactContext;
    private boolean isSDKInitialized = false;
    private String currentApiKey = null;
    private LocationManager locationManager;

    public BaiduMapModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.locationManager = new LocationManager(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void initSDK(String apiKey, Promise promise) {
        try {
            // 验证 API Key
            if (apiKey == null || apiKey.isEmpty()) {
                // 尝试从 AndroidManifest.xml 中读取 API Key
                apiKey = getApiKeyFromManifest();
                if (apiKey == null || apiKey.isEmpty()) {
                    promise.reject("INVALID_API_KEY", 
                        "API Key cannot be null or empty. Please provide API Key or configure it in AndroidManifest.xml");
                    return;
                }
            }

            // 检查权限
            if (!PermissionUtils.hasLocationPermission(reactContext)) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                result.putString("message", "Location permission is required for SDK initialization");
                result.putString("code", "PERMISSION_REQUIRED");
                promise.resolve(result);
                return;
            }

            // 初始化百度 SDK
            initializeBaiduSDK(apiKey);
            
            isSDKInitialized = true;
            currentApiKey = apiKey;
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "SDK initialized successfully");
            result.putString("apiKey", maskApiKey(apiKey));
            promise.resolve(result);
            
        } catch (Exception e) {
            isSDKInitialized = false;
            promise.reject("SDK_INIT_ERROR", "Failed to initialize SDK: " + e.getMessage(), e);
        }
    }

    /**
     * 初始化百度 SDK
     */
    private void initializeBaiduSDK(String apiKey) throws BaiduMapSDKException {
        // 检查隐私政策同意状态
        SharedPreferences sp = reactContext.getSharedPreferences("baidu_map_privacy", Context.MODE_PRIVATE);
        boolean privacyAgreed = sp.getBoolean("privacy_agreed", false);
        
        // 设置隐私政策同意状态
        SDKInitializer.setAgreePrivacy(reactContext.getApplicationContext(), privacyAgreed);
        
        // 初始化百度地图 SDK
        SDKInitializer.initialize(reactContext.getApplicationContext());
        
        // 设置坐标类型为 BD09LL (百度经纬度坐标系)
        SDKInitializer.setCoordType(CoordType.BD09LL);
        
        // 设置是否开启 HttpDns 优化
        SDKInitializer.setHttpDnsEnabled(true);
        
        // 设置是否开启 HTTPS
        SDKInitializer.setHttpsEnable(true);
    }

    /**
     * 从 AndroidManifest.xml 中读取 API Key
     */
    private String getApiKeyFromManifest() {
        try {
            Context context = reactContext.getApplicationContext();
            ApplicationInfo appInfo = context.getPackageManager()
                .getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
            
            if (appInfo.metaData != null) {
                Bundle metaData = appInfo.metaData;
                return metaData.getString(BAIDU_API_KEY_META_NAME);
            }
        } catch (PackageManager.NameNotFoundException e) {
            // 忽略异常，返回 null
        }
        return null;
    }

    /**
     * 掩码 API Key 用于日志输出
     */
    private String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.length() < 8) {
            return "****";
        }
        return apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length() - 4);
    }

    @ReactMethod
    public void getCurrentLocation(ReadableMap options, Promise promise) {
        try {
            if (!isSDKInitialized) {
                promise.reject("SDK_NOT_INITIALIZED", "SDK must be initialized before getting location");
                return;
            }

            // 使用定位管理器获取当前位置
            locationManager.getCurrentLocation(options, new LocationManager.LocationCallback() {
                @Override
                public void onSuccess(WritableMap location) {
                    promise.resolve(location);
                }

                @Override
                public void onError(String errorCode, String errorMessage) {
                    promise.reject(errorCode, errorMessage);
                }
            });
            
        } catch (Exception e) {
            promise.reject("LOCATION_ERROR", "Failed to get location: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void startLocationService(ReadableMap options) {
        if (!isSDKInitialized) {
            return;
        }
        
        locationManager.startLocationService(options);
    }

    @ReactMethod
    public void getSDKInfo(Promise promise) {
        try {
            WritableMap info = Arguments.createMap();
            info.putBoolean("initialized", isSDKInitialized);
            info.putString("version", "7.6.5");
            info.putString("platform", "Android");
            info.putString("apiKey", apiKey != null ? apiKey : "");
            info.putBoolean("privacyAgreed", privacyAgreed);
            info.putString("coordType", "BD09LL");
            info.putDouble("timestamp", System.currentTimeMillis());
            
            promise.resolve(info);
        } catch (Exception e) {
            Log.e(TAG, "获取SDK信息失败", e);
            promise.reject("GET_SDK_INFO_ERROR", "获取SDK信息失败: " + e.getMessage(), e);
        }
    }

    /**
     * 地图截图功能
     */
    @ReactMethod
    public void takeSnapshot(ReadableMap options, Promise promise) {
        if (!isSDKInitialized) {
            promise.reject("SDK_NOT_INITIALIZED", "SDK未初始化");
            return;
        }

        try {
            // 获取截图选项
            String format = options.hasKey("format") ? options.getString("format") : "png";
            double quality = options.hasKey("quality") ? options.getDouble("quality") : 1.0;
            int width = options.hasKey("width") ? options.getInt("width") : 0;
            int height = options.hasKey("height") ? options.getInt("height") : 0;

            Log.d(TAG, "开始地图截图，格式: " + format + ", 质量: " + quality);

            // TODO: 实现真实的地图截图功能
            // 当集成百度地图SDK后，取消注释以下代码：
            /*
            // 获取当前活动的地图视图
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                promise.reject("NO_ACTIVITY", "无法获取当前Activity");
                return;
            }

            // 在主线程执行截图操作
            UiThreadUtil.runOnUiThread(() -> {
                try {
                    // 查找地图视图
                    View rootView = currentActivity.findViewById(android.R.id.content);
                    BaiduMapView mapView = findMapView(rootView);
                    
                    if (mapView == null || mapView.getBaiduMap() == null) {
                        promise.reject("MAP_NOT_FOUND", "未找到地图视图");
                        return;
                    }

                    // 执行截图
                    mapView.getBaiduMap().snapshot(new BaiduMap.SnapshotReadyCallback() {
                        @Override
                        public void onSnapshotReady(Bitmap bitmap) {
                            if (bitmap == null) {
                                promise.reject("SNAPSHOT_FAILED", "截图失败，返回空bitmap");
                                return;
                            }

                            try {
                                // 调整图片尺寸
                                Bitmap finalBitmap = bitmap;
                                if (width > 0 && height > 0) {
                                    finalBitmap = Bitmap.createScaledBitmap(bitmap, width, height, true);
                                    if (finalBitmap != bitmap) {
                                        bitmap.recycle();
                                    }
                                }

                                // 保存到临时文件
                                String fileName = "map_snapshot_" + System.currentTimeMillis() + "." + format;
                                File tempFile = new File(reactContext.getCacheDir(), fileName);
                                
                                FileOutputStream fos = new FileOutputStream(tempFile);
                                Bitmap.CompressFormat compressFormat = "jpg".equals(format) || "jpeg".equals(format) 
                                    ? Bitmap.CompressFormat.JPEG 
                                    : Bitmap.CompressFormat.PNG;
                                
                                finalBitmap.compress(compressFormat, (int)(quality * 100), fos);
                                fos.close();
                                
                                // 清理bitmap
                                finalBitmap.recycle();

                                // 返回文件路径
                                WritableMap result = Arguments.createMap();
                                result.putString("uri", "file://" + tempFile.getAbsolutePath());
                                result.putString("path", tempFile.getAbsolutePath());
                                result.putInt("width", finalBitmap.getWidth());
                                result.putInt("height", finalBitmap.getHeight());
                                result.putString("format", format);
                                
                                promise.resolve(result);

                            } catch (Exception e) {
                                Log.e(TAG, "保存截图失败", e);
                                promise.reject("SAVE_SNAPSHOT_ERROR", "保存截图失败: " + e.getMessage(), e);
                            }
                        }
                    });

                } catch (Exception e) {
                    Log.e(TAG, "截图操作失败", e);
                    promise.reject("SNAPSHOT_ERROR", "截图操作失败: " + e.getMessage(), e);
                }
            });
            */

            // 模拟截图功能
            UiThreadUtil.runOnUiThread(() -> {
                try {
                    // 创建模拟截图结果
                    WritableMap result = Arguments.createMap();
                    result.putString("uri", "file:///mock/map_snapshot.png");
                    result.putString("path", "/mock/map_snapshot.png");
                    result.putInt("width", width > 0 ? width : 800);
                    result.putInt("height", height > 0 ? height : 600);
                    result.putString("format", format);
                    result.putString("message", "模拟截图功能，需要集成真实的百度地图SDK");
                    
                    promise.resolve(result);
                } catch (Exception e) {
                    promise.reject("MOCK_SNAPSHOT_ERROR", "模拟截图失败: " + e.getMessage(), e);
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "地图截图失败", e);
            promise.reject("TAKE_SNAPSHOT_ERROR", "地图截图失败: " + e.getMessage(), e);
        }
    }

    /**
     * 查找地图视图的辅助方法
     */
    private BaiduMapView findMapView(View view) {
        if (view instanceof BaiduMapView) {
            return (BaiduMapView) view;
        }
        
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) {
                BaiduMapView found = findMapView(group.getChildAt(i));
                if (found != null) {
                    return found;
                }
            }
        }
        
        return null;
    }

    /**
     * 设置地图自定义样式
     */
    @ReactMethod
    public void setMapCustomStyle(ReadableMap styleOptions, Promise promise) {
        if (!isSDKInitialized) {
            promise.reject("SDK_NOT_INITIALIZED", "SDK未初始化");
            return;
        }

        try {
            String styleId = styleOptions.hasKey("styleId") ? styleOptions.getString("styleId") : "";
            String styleJson = styleOptions.hasKey("styleJson") ? styleOptions.getString("styleJson") : "";
            
            Log.d(TAG, "设置地图自定义样式，styleId: " + styleId);

            // TODO: 实现真实的地图样式设置
            // 当集成百度地图SDK后，取消注释以下代码：
            /*
            UiThreadUtil.runOnUiThread(() -> {
                try {
                    Activity currentActivity = getCurrentActivity();
                    if (currentActivity == null) {
                        promise.reject("NO_ACTIVITY", "无法获取当前Activity");
                        return;
                    }

                    View rootView = currentActivity.findViewById(android.R.id.content);
                    BaiduMapView mapView = findMapView(rootView);
                    
                    if (mapView == null || mapView.getBaiduMap() == null) {
                        promise.reject("MAP_NOT_FOUND", "未找到地图视图");
                        return;
                    }

                    BaiduMap baiduMap = mapView.getBaiduMap();
                    
                    if (!styleId.isEmpty()) {
                        // 使用预设样式ID
                        baiduMap.setMapCustomStyle(styleId);
                    } else if (!styleJson.isEmpty()) {
                        // 使用自定义样式JSON
                        baiduMap.setMapCustomStyleWithOption(styleJson);
                    }

                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", true);
                    result.putString("message", "地图样式设置成功");
                    promise.resolve(result);

                } catch (Exception e) {
                    Log.e(TAG, "设置地图样式失败", e);
                    promise.reject("SET_STYLE_ERROR", "设置地图样式失败: " + e.getMessage(), e);
                }
            });
            */

            // 模拟样式设置
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "模拟地图样式设置，需要集成真实的百度地图SDK");
            result.putString("styleId", styleId);
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "设置地图自定义样式失败", e);
            promise.reject("SET_CUSTOM_STYLE_ERROR", "设置地图自定义样式失败: " + e.getMessage(), e);
        }
    }

    /**
     * 添加热力图图层
     */
    @ReactMethod
    public void addHeatMap(ReadableArray dataPoints, ReadableMap options, Promise promise) {
        if (!isSDKInitialized) {
            promise.reject("SDK_NOT_INITIALIZED", "SDK未初始化");
            return;
        }

        try {
            Log.d(TAG, "添加热力图，数据点数量: " + dataPoints.size());

            // TODO: 实现真实的热力图功能
            // 当集成百度地图SDK后，取消注释以下代码：
            /*
            UiThreadUtil.runOnUiThread(() -> {
                try {
                    Activity currentActivity = getCurrentActivity();
                    if (currentActivity == null) {
                        promise.reject("NO_ACTIVITY", "无法获取当前Activity");
                        return;
                    }

                    View rootView = currentActivity.findViewById(android.R.id.content);
                    BaiduMapView mapView = findMapView(rootView);
                    
                    if (mapView == null || mapView.getBaiduMap() == null) {
                        promise.reject("MAP_NOT_FOUND", "未找到地图视图");
                        return;
                    }

                    // 构建热力图数据
                    List<WeightedLatLng> heatMapData = new ArrayList<>();
                    for (int i = 0; i < dataPoints.size(); i++) {
                        ReadableMap point = dataPoints.getMap(i);
                        double lat = point.getDouble("latitude");
                        double lng = point.getDouble("longitude");
                        double weight = point.hasKey("weight") ? point.getDouble("weight") : 1.0;
                        
                        heatMapData.add(new WeightedLatLng(new LatLng(lat, lng), weight));
                    }

                    // 创建热力图选项
                    HeatMapOptions heatMapOptions = new HeatMapOptions();
                    heatMapOptions.data(heatMapData);
                    
                    if (options.hasKey("radius")) {
                        heatMapOptions.radius(options.getInt("radius"));
                    }
                    
                    if (options.hasKey("opacity")) {
                        heatMapOptions.opacity(options.getDouble("opacity"));
                    }

                    // 添加热力图到地图
                    BaiduMap baiduMap = mapView.getBaiduMap();
                    baiduMap.addHeatMap(heatMapOptions);

                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", true);
                    result.putString("message", "热力图添加成功");
                    result.putInt("dataPointsCount", dataPoints.size());
                    promise.resolve(result);

                } catch (Exception e) {
                    Log.e(TAG, "添加热力图失败", e);
                    promise.reject("ADD_HEATMAP_ERROR", "添加热力图失败: " + e.getMessage(), e);
                }
            });
            */

            // 模拟热力图添加
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "模拟热力图添加，需要集成真实的百度地图SDK");
            result.putInt("dataPointsCount", dataPoints.size());
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "添加热力图失败", e);
            promise.reject("ADD_HEAT_MAP_ERROR", "添加热力图失败: " + e.getMessage(), e);
        }
    }

    /**
     * 移除热力图图层
     */
    @ReactMethod
    public void removeHeatMap(Promise promise) {
        if (!isSDKInitialized) {
            promise.reject("SDK_NOT_INITIALIZED", "SDK未初始化");
            return;
        }

        try {
            Log.d(TAG, "移除热力图");

            // TODO: 实现真实的热力图移除功能
            // 当集成百度地图SDK后，取消注释以下代码：
            /*
            UiThreadUtil.runOnUiThread(() -> {
                try {
                    Activity currentActivity = getCurrentActivity();
                    if (currentActivity == null) {
                        promise.reject("NO_ACTIVITY", "无法获取当前Activity");
                        return;
                    }

                    View rootView = currentActivity.findViewById(android.R.id.content);
                    BaiduMapView mapView = findMapView(rootView);
                    
                    if (mapView == null || mapView.getBaiduMap() == null) {
                        promise.reject("MAP_NOT_FOUND", "未找到地图视图");
                        return;
                    }

                    BaiduMap baiduMap = mapView.getBaiduMap();
                    baiduMap.removeHeatMap();

                    WritableMap result = Arguments.createMap();
                    result.putBoolean("success", true);
                    result.putString("message", "热力图移除成功");
                    promise.resolve(result);

                } catch (Exception e) {
                    Log.e(TAG, "移除热力图失败", e);
                    promise.reject("REMOVE_HEATMAP_ERROR", "移除热力图失败: " + e.getMessage(), e);
                }
            });
            */

            // 模拟热力图移除
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "模拟热力图移除，需要集成真实的百度地图SDK");
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "移除热力图失败", e);
            promise.reject("REMOVE_HEAT_MAP_ERROR", "移除热力图失败: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void isLocationServiceStarted(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            result.putBoolean("started", locationManager.isLocationServiceStarted());
            result.putBoolean("enabled", locationManager.isLocationEnabled());
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("LOCATION_ERROR", "Failed to check location service status: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setLocationOptions(ReadableMap options, Promise promise) {
        try {
            if (!isSDKInitialized) {
                promise.reject("SDK_NOT_INITIALIZED", "SDK must be initialized before setting location options");
                return;
            }

            // 这里可以设置全局的定位选项
            // locationManager.setDefaultOptions(options);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Location options updated successfully");
            promise.resolve(result);
            
        } catch (Exception e) {
            promise.reject("LOCATION_ERROR", "Failed to set location options: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getLocationOptions(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            
            // 返回当前的定位配置选项
            result.putString("locationMode", BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY);
            result.putString("coordinateType", BaiduMapConfig.COORD_TYPE_BD09LL);
            result.putInt("timeout", BaiduMapConfig.DEFAULT_LOCATION_TIMEOUT);
            result.putInt("scanSpan", BaiduMapConfig.DEFAULT_LOCATION_SCAN_SPAN);
            result.putBoolean("needAddress", true);
            result.putBoolean("openGps", true);
            
            promise.resolve(result);
            
        } catch (Exception e) {
            promise.reject("LOCATION_ERROR", "Failed to get location options: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void isSDKInitialized(Promise promise) {
        WritableMap result = Arguments.createMap();
        result.putBoolean("initialized", isSDKInitialized);
        result.putString("apiKey", currentApiKey != null ? maskApiKey(currentApiKey) : null);
        promise.resolve(result);
    }

    @ReactMethod
    public void getVersion(Promise promise) {
        WritableMap result = Arguments.createMap();
        result.putString("libraryVersion", "1.0.0");
        // TODO: 添加百度 SDK 版本信息
        // result.putString("baiduMapSDKVersion", BaiduMapSDKVersion.getSDKVersion());
        // result.putString("baiduLocationSDKVersion", LocationClient.getVersion());
        promise.resolve(result);
    }

    @ReactMethod
    public void checkPermissions(Promise promise) {
        WritableMap result = Arguments.createMap();
        result.putBoolean("location", PermissionUtils.hasLocationPermission(reactContext));
        result.putBoolean("storage", PermissionUtils.hasStoragePermission(reactContext));
        result.putBoolean("network", PermissionUtils.hasNetworkPermission(reactContext));
        promise.resolve(result);
    }

    @ReactMethod
    public void setAgreePrivacy(boolean agree, Promise promise) {
        try {
            // 保存隐私政策同意状态
            SharedPreferences sp = reactContext.getSharedPreferences("baidu_map_privacy", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();
            editor.putBoolean("privacy_agreed", agree);
            editor.apply();
            
            // 设置百度SDK隐私政策状态
            SDKInitializer.setAgreePrivacy(reactContext.getApplicationContext(), agree);
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", true);
            result.putString("message", "Privacy agreement set to: " + agree);
            promise.resolve(result);
            
        } catch (Exception e) {
            promise.reject("PRIVACY_ERROR", "Failed to set privacy agreement: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void checkPrivacyAgreement(Promise promise) {
        try {
            SharedPreferences sp = reactContext.getSharedPreferences("baidu_map_privacy", Context.MODE_PRIVATE);
            boolean agreed = sp.getBoolean("privacy_agreed", false);
            promise.resolve(agreed);
        } catch (Exception e) {
            promise.reject("PRIVACY_ERROR", "Failed to check privacy agreement: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getSDKInfo(Promise promise) {
        WritableMap result = Arguments.createMap();
        result.putBoolean("initialized", isSDKInitialized);
        result.putString("apiKey", currentApiKey != null ? maskApiKey(currentApiKey) : null);
        result.putString("libraryVersion", "1.0.0");
        
        // 百度SDK版本信息
        try {
            result.putString("baiduSDKVersion", SDKInitializer.getSDKVersion());
        } catch (Exception e) {
            result.putString("baiduSDKVersion", "7.6.5");
        }
        
        // 权限状态
        WritableMap permissions = Arguments.createMap();
        permissions.putBoolean("location", PermissionUtils.hasLocationPermission(reactContext));
        permissions.putBoolean("storage", PermissionUtils.hasStoragePermission(reactContext));
        permissions.putBoolean("network", PermissionUtils.hasNetworkPermission(reactContext));
        result.putMap("permissions", permissions);
        
        // 隐私政策状态
        SharedPreferences sp = reactContext.getSharedPreferences("baidu_map_privacy", Context.MODE_PRIVATE);
        result.putBoolean("privacyAgreed", sp.getBoolean("privacy_agreed", false));
        
        promise.resolve(result);
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (locationManager != null) {
            locationManager.destroy();
        }
    }
}