package io.github.winyh.baidumap;

public class BaiduMapConfig {
    
    // 默认配置值
    public static final String DEFAULT_COORD_TYPE = "bd09ll";
    public static final boolean DEFAULT_ENABLE_HTTPS = true;
    public static final boolean DEFAULT_ENABLE_HTTP_DNS = true;
    public static final int DEFAULT_LOCATION_TIMEOUT = 30000; // 30秒
    public static final int DEFAULT_LOCATION_SCAN_SPAN = 1000; // 1秒
    
    // 坐标系类型
    public static final String COORD_TYPE_BD09LL = "bd09ll";
    public static final String COORD_TYPE_BD09MC = "bd09mc";
    public static final String COORD_TYPE_GCJ02 = "gcj02";
    public static final String COORD_TYPE_WGS84 = "wgs84";
    
    // 定位模式
    public static final String LOCATION_MODE_HIGH_ACCURACY = "high_accuracy";
    public static final String LOCATION_MODE_BATTERY_SAVING = "battery_saving";
    public static final String LOCATION_MODE_DEVICE_SENSORS = "device_sensors";
    
    // 地图类型
    public static final String MAP_TYPE_NORMAL = "normal";
    public static final String MAP_TYPE_SATELLITE = "satellite";
    public static final String MAP_TYPE_HYBRID = "hybrid";
    
    // 错误码
    public static final String ERROR_SDK_NOT_INITIALIZED = "SDK_NOT_INITIALIZED";
    public static final String ERROR_INVALID_API_KEY = "INVALID_API_KEY";
    public static final String ERROR_LOCATION_PERMISSION_DENIED = "LOCATION_PERMISSION_DENIED";
    public static final String ERROR_LOCATION_SERVICE_DISABLED = "LOCATION_SERVICE_DISABLED";
    public static final String ERROR_NETWORK_ERROR = "NETWORK_ERROR";
    public static final String ERROR_UNKNOWN_ERROR = "UNKNOWN_ERROR";
    public static final String ERROR_LOCATION_TIMEOUT = "LOCATION_TIMEOUT";
    public static final String ERROR_LOCATION_FAILED = "LOCATION_FAILED";
    
    // 权限请求码
    public static final int REQUEST_CODE_LOCATION_PERMISSION = 1001;
    public static final int REQUEST_CODE_STORAGE_PERMISSION = 1002;
    
    private BaiduMapConfig() {
        // 私有构造函数，防止实例化
    }
    
    /**
     * 验证坐标系类型是否有效
     */
    public static boolean isValidCoordType(String coordType) {
        return COORD_TYPE_BD09LL.equals(coordType) ||
               COORD_TYPE_BD09MC.equals(coordType) ||
               COORD_TYPE_GCJ02.equals(coordType) ||
               COORD_TYPE_WGS84.equals(coordType);
    }
    
    /**
     * 验证定位模式是否有效
     */
    public static boolean isValidLocationMode(String locationMode) {
        return LOCATION_MODE_HIGH_ACCURACY.equals(locationMode) ||
               LOCATION_MODE_BATTERY_SAVING.equals(locationMode) ||
               LOCATION_MODE_DEVICE_SENSORS.equals(locationMode);
    }
    
    /**
     * 验证地图类型是否有效
     */
    public static boolean isValidMapType(String mapType) {
        return MAP_TYPE_NORMAL.equals(mapType) ||
               MAP_TYPE_SATELLITE.equals(mapType) ||
               MAP_TYPE_HYBRID.equals(mapType);
    }
    
    /**
     * 获取百度地图类型常量
     */
    public static int getBaiduMapType(String mapType) {
        // TODO: 当集成百度 SDK 后，返回对应的常量
        // switch (mapType) {
        //     case MAP_TYPE_SATELLITE:
        //         return BaiduMap.MAP_TYPE_SATELLITE;
        //     case MAP_TYPE_HYBRID:
        //         return BaiduMap.MAP_TYPE_HYBRID;
        //     default:
        //         return BaiduMap.MAP_TYPE_NORMAL;
        // }
        
        // 临时返回值
        switch (mapType) {
            case MAP_TYPE_SATELLITE:
                return 2;
            case MAP_TYPE_HYBRID:
                return 3;
            default:
                return 1;
        }
    }
    
    /**
     * 获取百度定位模式常量
     */
    public static String getBaiduLocationMode(String locationMode) {
        // TODO: 当集成百度定位 SDK 后，返回对应的模式
        // switch (locationMode) {
        //     case LOCATION_MODE_BATTERY_SAVING:
        //         return LocationClientOption.LocationMode.Battery_Saving;
        //     case LOCATION_MODE_DEVICE_SENSORS:
        //         return LocationClientOption.LocationMode.Device_Sensors;
        //     default:
        //         return LocationClientOption.LocationMode.Hight_Accuracy;
        // }
        
        // 临时返回原值
        return locationMode;
    }
}