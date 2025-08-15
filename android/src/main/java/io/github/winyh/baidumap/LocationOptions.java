package io.github.winyh.baidumap;

import com.facebook.react.bridge.ReadableMap;

public class LocationOptions {
    
    // 定位模式
    private String locationMode = BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY;
    
    // 坐标系类型
    private String coordinateType = BaiduMapConfig.COORD_TYPE_BD09LL;
    
    // 定位间隔 (毫秒)
    private int scanSpan = BaiduMapConfig.DEFAULT_LOCATION_SCAN_SPAN;
    
    // 定位超时 (毫秒)
    private int timeout = BaiduMapConfig.DEFAULT_LOCATION_TIMEOUT;
    
    // 距离过滤器 (米)
    private double distanceFilter = 0;
    
    // 是否需要地址信息
    private boolean needAddress = true;
    
    // 是否需要位置描述
    private boolean needLocationDescribe = true;
    
    // 是否需要POI信息
    private boolean needLocationPoiList = false;
    
    // 是否需要海拔信息
    private boolean needAltitude = false;
    
    // 是否开启GPS
    private boolean openGps = true;
    
    // 是否允许模拟GPS
    private boolean enableSimulateGps = false;
    
    // 是否忽略缓存异常
    private boolean ignoreCacheException = false;
    
    // 是否忽略杀死进程
    private boolean ignoreKillProcess = true;
    
    // WiFi缓存超时时间 (毫秒)
    private int wifiCacheTimeOut = 5 * 60 * 1000;
    
    // 是否需要设备方向信息
    private boolean needDeviceDirect = false;
    
    // 是否开启位置通知
    private boolean locationNotify = true;

    public LocationOptions() {
        // 使用默认配置
    }

    public LocationOptions(ReadableMap options) {
        if (options != null) {
            updateFromReadableMap(options);
        }
    }

    /**
     * 从 ReadableMap 更新配置
     */
    public void updateFromReadableMap(ReadableMap options) {
        if (options == null) return;

        if (options.hasKey("locationMode")) {
            String mode = options.getString("locationMode");
            if (BaiduMapConfig.isValidLocationMode(mode)) {
                this.locationMode = mode;
            }
        }

        if (options.hasKey("coordinateType")) {
            String coordType = options.getString("coordinateType");
            if (BaiduMapConfig.isValidCoordType(coordType)) {
                this.coordinateType = coordType;
            }
        }

        if (options.hasKey("timeout")) {
            this.timeout = Math.max(1000, options.getInt("timeout"));
        }

        if (options.hasKey("distanceFilter")) {
            this.distanceFilter = Math.max(0, options.getDouble("distanceFilter"));
        }

        if (options.hasKey("enableHighAccuracy")) {
            boolean enableHighAccuracy = options.getBoolean("enableHighAccuracy");
            if (enableHighAccuracy) {
                this.locationMode = BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY;
                this.openGps = true;
            } else {
                this.locationMode = BaiduMapConfig.LOCATION_MODE_BATTERY_SAVING;
                this.openGps = false;
            }
        }

        if (options.hasKey("maximumAge")) {
            // 将 maximumAge 转换为缓存超时时间
            int maximumAge = options.getInt("maximumAge");
            this.wifiCacheTimeOut = Math.max(0, maximumAge);
        }

        if (options.hasKey("needAddress")) {
            this.needAddress = options.getBoolean("needAddress");
        }

        if (options.hasKey("needLocationDescribe")) {
            this.needLocationDescribe = options.getBoolean("needLocationDescribe");
        }

        if (options.hasKey("needLocationPoiList")) {
            this.needLocationPoiList = options.getBoolean("needLocationPoiList");
        }

        if (options.hasKey("needAltitude")) {
            this.needAltitude = options.getBoolean("needAltitude");
        }

        if (options.hasKey("openGps")) {
            this.openGps = options.getBoolean("openGps");
        }

        if (options.hasKey("enableSimulateGps")) {
            this.enableSimulateGps = options.getBoolean("enableSimulateGps");
        }

        if (options.hasKey("scanSpan")) {
            this.scanSpan = Math.max(0, options.getInt("scanSpan"));
        }

        if (options.hasKey("ignoreCacheException")) {
            this.ignoreCacheException = options.getBoolean("ignoreCacheException");
        }

        if (options.hasKey("ignoreKillProcess")) {
            this.ignoreKillProcess = options.getBoolean("ignoreKillProcess");
        }

        if (options.hasKey("wifiCacheTimeOut")) {
            this.wifiCacheTimeOut = Math.max(0, options.getInt("wifiCacheTimeOut"));
        }

        if (options.hasKey("needDeviceDirect")) {
            this.needDeviceDirect = options.getBoolean("needDeviceDirect");
        }

        if (options.hasKey("locationNotify")) {
            this.locationNotify = options.getBoolean("locationNotify");
        }
    }

    /**
     * 获取百度定位模式
     */
    public String getBaiduLocationMode() {
        return BaiduMapConfig.getBaiduLocationMode(locationMode);
    }

    /**
     * 是否为单次定位
     */
    public boolean isSingleLocation() {
        return scanSpan == 0;
    }

    /**
     * 创建用于高精度定位的配置
     */
    public static LocationOptions createHighAccuracyOptions() {
        LocationOptions options = new LocationOptions();
        options.locationMode = BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY;
        options.openGps = true;
        options.needAddress = true;
        options.needLocationDescribe = true;
        options.scanSpan = 1000;
        return options;
    }

    /**
     * 创建用于省电模式的配置
     */
    public static LocationOptions createBatterySavingOptions() {
        LocationOptions options = new LocationOptions();
        options.locationMode = BaiduMapConfig.LOCATION_MODE_BATTERY_SAVING;
        options.openGps = false;
        options.needAddress = false;
        options.needLocationDescribe = false;
        options.scanSpan = 5000;
        return options;
    }

    /**
     * 创建用于单次定位的配置
     */
    public static LocationOptions createSingleLocationOptions() {
        LocationOptions options = new LocationOptions();
        options.locationMode = BaiduMapConfig.LOCATION_MODE_HIGH_ACCURACY;
        options.openGps = true;
        options.needAddress = true;
        options.needLocationDescribe = true;
        options.scanSpan = 0; // 单次定位
        return options;
    }

    // Getters and Setters
    public String getLocationMode() {
        return locationMode;
    }

    public void setLocationMode(String locationMode) {
        if (BaiduMapConfig.isValidLocationMode(locationMode)) {
            this.locationMode = locationMode;
        }
    }

    public String getCoordinateType() {
        return coordinateType;
    }

    public void setCoordinateType(String coordinateType) {
        if (BaiduMapConfig.isValidCoordType(coordinateType)) {
            this.coordinateType = coordinateType;
        }
    }

    public int getScanSpan() {
        return scanSpan;
    }

    public void setScanSpan(int scanSpan) {
        this.scanSpan = Math.max(0, scanSpan);
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = Math.max(1000, timeout);
    }

    public double getDistanceFilter() {
        return distanceFilter;
    }

    public void setDistanceFilter(double distanceFilter) {
        this.distanceFilter = Math.max(0, distanceFilter);
    }

    public boolean isNeedAddress() {
        return needAddress;
    }

    public void setNeedAddress(boolean needAddress) {
        this.needAddress = needAddress;
    }

    public boolean isNeedLocationDescribe() {
        return needLocationDescribe;
    }

    public void setNeedLocationDescribe(boolean needLocationDescribe) {
        this.needLocationDescribe = needLocationDescribe;
    }

    public boolean isNeedLocationPoiList() {
        return needLocationPoiList;
    }

    public void setNeedLocationPoiList(boolean needLocationPoiList) {
        this.needLocationPoiList = needLocationPoiList;
    }

    public boolean isNeedAltitude() {
        return needAltitude;
    }

    public void setNeedAltitude(boolean needAltitude) {
        this.needAltitude = needAltitude;
    }

    public boolean isOpenGps() {
        return openGps;
    }

    public void setOpenGps(boolean openGps) {
        this.openGps = openGps;
    }

    public boolean isEnableSimulateGps() {
        return enableSimulateGps;
    }

    public void setEnableSimulateGps(boolean enableSimulateGps) {
        this.enableSimulateGps = enableSimulateGps;
    }

    public boolean isIgnoreCacheException() {
        return ignoreCacheException;
    }

    public void setIgnoreCacheException(boolean ignoreCacheException) {
        this.ignoreCacheException = ignoreCacheException;
    }

    public boolean isIgnoreKillProcess() {
        return ignoreKillProcess;
    }

    public void setIgnoreKillProcess(boolean ignoreKillProcess) {
        this.ignoreKillProcess = ignoreKillProcess;
    }

    public int getWifiCacheTimeOut() {
        return wifiCacheTimeOut;
    }

    public void setWifiCacheTimeOut(int wifiCacheTimeOut) {
        this.wifiCacheTimeOut = Math.max(0, wifiCacheTimeOut);
    }

    public boolean isNeedDeviceDirect() {
        return needDeviceDirect;
    }

    public void setNeedDeviceDirect(boolean needDeviceDirect) {
        this.needDeviceDirect = needDeviceDirect;
    }

    public boolean isLocationNotify() {
        return locationNotify;
    }

    public void setLocationNotify(boolean locationNotify) {
        this.locationNotify = locationNotify;
    }

    @Override
    public String toString() {
        return "LocationOptions{" +
                "locationMode='" + locationMode + '\'' +
                ", coordinateType='" + coordinateType + '\'' +
                ", scanSpan=" + scanSpan +
                ", timeout=" + timeout +
                ", distanceFilter=" + distanceFilter +
                ", needAddress=" + needAddress +
                ", needLocationDescribe=" + needLocationDescribe +
                ", openGps=" + openGps +
                '}';
    }
}