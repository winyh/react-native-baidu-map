package io.github.winyh.baidumap;

import androidx.annotation.NonNull;

import com.baidu.mapapi.search.core.SearchResult;
import com.baidu.mapapi.search.geocode.GeoCodeOption;
import com.baidu.mapapi.search.geocode.GeoCodeResult;
import com.baidu.mapapi.search.geocode.GeoCoder;
import com.baidu.mapapi.search.geocode.OnGetGeoCoderResultListener;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeOption;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeResult;
import com.baidu.mapapi.search.poi.OnGetPoiSearchResultListener;
import com.baidu.mapapi.search.poi.PoiCitySearchOption;
import com.baidu.mapapi.search.poi.PoiDetailResult;
import com.baidu.mapapi.search.poi.PoiIndoorResult;
import com.baidu.mapapi.search.poi.PoiNearbySearchOption;
import com.baidu.mapapi.search.poi.PoiResult;
import com.baidu.mapapi.search.poi.PoiSearch;
import com.baidu.mapapi.search.sug.OnGetSuggestionResultListener;
import com.baidu.mapapi.search.sug.SuggestionResult;
import com.baidu.mapapi.search.sug.SuggestionSearch;
import com.baidu.mapapi.search.sug.SuggestionSearchOption;
import com.baidu.mapapi.model.LatLng;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;

import java.util.HashMap;
import java.util.Map;

@ReactModule(name = GeocodingModule.NAME)
public class GeocodingModule extends ReactContextBaseJavaModule implements 
    OnGetGeoCoderResultListener, OnGetPoiSearchResultListener, OnGetSuggestionResultListener {
    
    public static final String NAME = "BaiduGeocodingModule";
    
    private GeoCoder geoCoder;
    private PoiSearch poiSearch;
    private SuggestionSearch suggestionSearch;
    private Map<String, Promise> pendingPromises;
    private Map<String, String> requestTypes;

    public GeocodingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.pendingPromises = new HashMap<>();
        this.requestTypes = new HashMap<>();
        
        // 初始化搜索组件
        this.geoCoder = GeoCoder.newInstance();
        this.geoCoder.setOnGetGeoCodeResultListener(this);
        
        this.poiSearch = PoiSearch.newInstance();
        this.poiSearch.setOnGetPoiSearchResultListener(this);
        
        this.suggestionSearch = SuggestionSearch.newInstance();
        this.suggestionSearch.setOnGetSuggestionResultListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void geocoding(String address, String city, Promise promise) {
        if (address == null || address.trim().isEmpty()) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "INVALID_PARAMETER");
            error.putString("message", "地址不能为空");
            result.putMap("error", error);
            promise.resolve(result);
            return;
        }

        try {
            String requestId = "geocoding_" + System.currentTimeMillis();
            pendingPromises.put(requestId, promise);
            requestTypes.put(requestId, "geocoding");

            GeoCodeOption option = new GeoCodeOption()
                .address(address);
            
            if (city != null && !city.trim().isEmpty()) {
                option.city(city);
            }

            boolean success = geoCoder.geocode(option);
            if (!success) {
                pendingPromises.remove(requestId);
                requestTypes.remove(requestId);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "GEOCODING_ERROR");
                error.putString("message", "地理编码请求失败");
                result.putMap("error", error);
                promise.resolve(result);
            }
        } catch (Exception e) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "GEOCODING_ERROR");
            error.putString("message", "地理编码异常: " + e.getMessage());
            result.putMap("error", error);
            promise.resolve(result);
        }
    }

    @ReactMethod
    public void reverseGeocoding(ReadableMap coordinate, int radius, Promise promise) {
        if (coordinate == null || !coordinate.hasKey("latitude") || !coordinate.hasKey("longitude")) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "INVALID_PARAMETER");
            error.putString("message", "坐标参数无效");
            result.putMap("error", error);
            promise.resolve(result);
            return;
        }

        try {
            double lat = coordinate.getDouble("latitude");
            double lng = coordinate.getDouble("longitude");
            
            String requestId = "reverse_geocoding_" + System.currentTimeMillis();
            pendingPromises.put(requestId, promise);
            requestTypes.put(requestId, "reverse_geocoding");

            ReverseGeoCodeOption option = new ReverseGeoCodeOption()
                .location(new LatLng(lat, lng))
                .radius(radius);

            boolean success = geoCoder.reverseGeoCode(option);
            if (!success) {
                pendingPromises.remove(requestId);
                requestTypes.remove(requestId);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "REVERSE_GEOCODING_ERROR");
                error.putString("message", "逆地理编码请求失败");
                result.putMap("error", error);
                promise.resolve(result);
            }
        } catch (Exception e) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "REVERSE_GEOCODING_ERROR");
            error.putString("message", "逆地理编码异常: " + e.getMessage());
            result.putMap("error", error);
            promise.resolve(result);
        }
    }

    @ReactMethod
    public void searchPOI(ReadableMap options, Promise promise) {
        if (options == null || !options.hasKey("keyword")) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "INVALID_PARAMETER");
            error.putString("message", "搜索关键词不能为空");
            result.putMap("error", error);
            promise.resolve(result);
            return;
        }

        try {
            String keyword = options.getString("keyword");
            if (keyword == null || keyword.trim().isEmpty()) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "INVALID_PARAMETER");
                error.putString("message", "搜索关键词不能为空");
                result.putMap("error", error);
                promise.resolve(result);
                return;
            }

            String requestId = "poi_search_" + System.currentTimeMillis();
            pendingPromises.put(requestId, promise);
            requestTypes.put(requestId, "poi_search");

            PoiCitySearchOption option = new PoiCitySearchOption()
                .keyword(keyword);

            if (options.hasKey("city")) {
                String city = options.getString("city");
                if (city != null && !city.trim().isEmpty()) {
                    option.city(city);
                }
            }

            if (options.hasKey("pageIndex")) {
                option.pageNum(options.getInt("pageIndex"));
            }

            if (options.hasKey("pageSize")) {
                option.pageCapacity(options.getInt("pageSize"));
            }

            boolean success = poiSearch.searchInCity(option);
            if (!success) {
                pendingPromises.remove(requestId);
                requestTypes.remove(requestId);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "POI_SEARCH_ERROR");
                error.putString("message", "POI搜索请求失败");
                result.putMap("error", error);
                promise.resolve(result);
            }
        } catch (Exception e) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "POI_SEARCH_ERROR");
            error.putString("message", "POI搜索异常: " + e.getMessage());
            result.putMap("error", error);
            promise.resolve(result);
        }
    }

    @ReactMethod
    public void searchNearby(ReadableMap options, Promise promise) {
        if (options == null || !options.hasKey("location") || !options.hasKey("radius")) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "INVALID_PARAMETER");
            error.putString("message", "搜索位置和半径参数无效");
            result.putMap("error", error);
            promise.resolve(result);
            return;
        }

        try {
            ReadableMap location = options.getMap("location");
            if (location == null || !location.hasKey("latitude") || !location.hasKey("longitude")) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "INVALID_PARAMETER");
                error.putString("message", "搜索位置参数无效");
                result.putMap("error", error);
                promise.resolve(result);
                return;
            }

            double lat = location.getDouble("latitude");
            double lng = location.getDouble("longitude");
            int radius = options.getInt("radius");

            if (radius <= 0) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "INVALID_PARAMETER");
                error.putString("message", "搜索半径必须大于0");
                result.putMap("error", error);
                promise.resolve(result);
                return;
            }

            String requestId = "nearby_search_" + System.currentTimeMillis();
            pendingPromises.put(requestId, promise);
            requestTypes.put(requestId, "nearby_search");

            PoiNearbySearchOption option = new PoiNearbySearchOption()
                .location(new LatLng(lat, lng))
                .radius(radius);

            if (options.hasKey("keyword")) {
                String keyword = options.getString("keyword");
                if (keyword != null && !keyword.trim().isEmpty()) {
                    option.keyword(keyword);
                }
            }

            if (options.hasKey("pageIndex")) {
                option.pageNum(options.getInt("pageIndex"));
            }

            if (options.hasKey("pageSize")) {
                option.pageCapacity(options.getInt("pageSize"));
            }

            boolean success = poiSearch.searchNearby(option);
            if (!success) {
                pendingPromises.remove(requestId);
                requestTypes.remove(requestId);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "NEARBY_SEARCH_ERROR");
                error.putString("message", "周边搜索请求失败");
                result.putMap("error", error);
                promise.resolve(result);
            }
        } catch (Exception e) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "NEARBY_SEARCH_ERROR");
            error.putString("message", "周边搜索异常: " + e.getMessage());
            result.putMap("error", error);
            promise.resolve(result);
        }
    }

    @ReactMethod
    public void searchSuggestion(ReadableMap options, Promise promise) {
        if (options == null || !options.hasKey("keyword")) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "INVALID_PARAMETER");
            error.putString("message", "搜索关键词不能为空");
            result.putMap("error", error);
            promise.resolve(result);
            return;
        }

        try {
            String keyword = options.getString("keyword");
            if (keyword == null || keyword.trim().isEmpty()) {
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "INVALID_PARAMETER");
                error.putString("message", "搜索关键词不能为空");
                result.putMap("error", error);
                promise.resolve(result);
                return;
            }

            String requestId = "suggestion_search_" + System.currentTimeMillis();
            pendingPromises.put(requestId, promise);
            requestTypes.put(requestId, "suggestion_search");

            SuggestionSearchOption option = new SuggestionSearchOption()
                .keyword(keyword);

            if (options.hasKey("city")) {
                String city = options.getString("city");
                if (city != null && !city.trim().isEmpty()) {
                    option.city(city);
                }
            }

            if (options.hasKey("cityLimit")) {
                option.citylimit(options.getBoolean("cityLimit"));
            }

            boolean success = suggestionSearch.requestSuggestion(option);
            if (!success) {
                pendingPromises.remove(requestId);
                requestTypes.remove(requestId);
                
                WritableMap result = Arguments.createMap();
                result.putBoolean("success", false);
                WritableMap error = Arguments.createMap();
                error.putString("code", "SUGGESTION_SEARCH_ERROR");
                error.putString("message", "搜索建议请求失败");
                result.putMap("error", error);
                promise.resolve(result);
            }
        } catch (Exception e) {
            WritableMap result = Arguments.createMap();
            result.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "SUGGESTION_SEARCH_ERROR");
            error.putString("message", "搜索建议异常: " + e.getMessage());
            result.putMap("error", error);
            promise.resolve(result);
        }
    }

    // 地理编码结果回调
    @Override
    public void onGetGeoCodeResult(GeoCodeResult result) {
        String requestId = findRequestId("geocoding");
        if (requestId == null) return;

        Promise promise = pendingPromises.remove(requestId);
        requestTypes.remove(requestId);

        if (promise == null) return;

        WritableMap resultMap = Arguments.createMap();
        
        if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
            resultMap.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "GEOCODING_ERROR");
            error.putString("message", getErrorMessage(result != null ? result.error : null));
            resultMap.putMap("error", error);
        } else {
            resultMap.putBoolean("success", true);
            WritableMap data = Arguments.createMap();
            data.putDouble("latitude", result.getLocation().latitude);
            data.putDouble("longitude", result.getLocation().longitude);
            data.putString("formattedAddress", result.getAddress() != null ? result.getAddress() : "");
            resultMap.putMap("data", data);
        }
        
        promise.resolve(resultMap);
    }

    // 逆地理编码结果回调
    @Override
    public void onGetReverseGeoCodeResult(ReverseGeoCodeResult result) {
        String requestId = findRequestId("reverse_geocoding");
        if (requestId == null) return;

        Promise promise = pendingPromises.remove(requestId);
        requestTypes.remove(requestId);

        if (promise == null) return;

        WritableMap resultMap = Arguments.createMap();
        
        if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
            resultMap.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "REVERSE_GEOCODING_ERROR");
            error.putString("message", getErrorMessage(result != null ? result.error : null));
            resultMap.putMap("error", error);
        } else {
            resultMap.putBoolean("success", true);
            WritableMap data = Arguments.createMap();
            data.putString("formattedAddress", result.getAddress() != null ? result.getAddress() : "");
            
            if (result.getAddressDetail() != null) {
                data.putString("country", result.getAddressDetail().country != null ? result.getAddressDetail().country : "");
                data.putString("province", result.getAddressDetail().province != null ? result.getAddressDetail().province : "");
                data.putString("city", result.getAddressDetail().city != null ? result.getAddressDetail().city : "");
                data.putString("district", result.getAddressDetail().district != null ? result.getAddressDetail().district : "");
                data.putString("street", result.getAddressDetail().street != null ? result.getAddressDetail().street : "");
                data.putString("streetNumber", result.getAddressDetail().streetNumber != null ? result.getAddressDetail().streetNumber : "");
                data.putString("adCode", result.getAddressDetail().adcode != null ? result.getAddressDetail().adcode : "");
            }
            
            data.putString("business", result.getBusiness() != null ? result.getBusiness() : "");
            data.putString("sematicDescription", result.getSematicDescription() != null ? result.getSematicDescription() : "");
            
            resultMap.putMap("data", data);
        }
        
        promise.resolve(resultMap);
    }

    // POI搜索结果回调
    @Override
    public void onGetPoiResult(PoiResult result) {
        String requestId = findRequestId("poi_search", "nearby_search");
        if (requestId == null) return;

        Promise promise = pendingPromises.remove(requestId);
        requestTypes.remove(requestId);

        if (promise == null) return;

        WritableMap resultMap = Arguments.createMap();
        
        if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
            resultMap.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "POI_SEARCH_ERROR");
            error.putString("message", getErrorMessage(result != null ? result.error : null));
            resultMap.putMap("error", error);
        } else {
            resultMap.putBoolean("success", true);
            WritableMap data = Arguments.createMap();
            
            int totalPages = result.getTotalPageNum();
            data.putInt("totalPageNumber", totalPages);
            data.putInt("totalResultNumber", result.getTotalPoiNum());
            data.putInt("currentPageNumber", result.getCurrentPageNum());
            data.putInt("pageSize", result.getAllPoi() != null ? result.getAllPoi().size() : 0);
            
            WritableArray poiList = Arguments.createArray();
            if (result.getAllPoi() != null) {
                for (com.baidu.mapapi.search.poi.PoiInfo poi : result.getAllPoi()) {
                    WritableMap poiData = Arguments.createMap();
                    poiData.putString("name", poi.name != null ? poi.name : "");
                    poiData.putString("address", poi.address != null ? poi.address : "");
                    poiData.putDouble("latitude", poi.location.latitude);
                    poiData.putDouble("longitude", poi.location.longitude);
                    poiData.putString("uid", poi.uid != null ? poi.uid : "");
                    poiData.putString("phone", poi.phoneNum != null ? poi.phoneNum : "");
                    poiData.putString("type", poi.type.name());
                    poiList.pushMap(poiData);
                }
            }
            data.putArray("poiInfoList", poiList);
            
            resultMap.putMap("data", data);
        }
        
        promise.resolve(resultMap);
    }

    // 搜索建议结果回调
    @Override
    public void onGetSuggestionResult(SuggestionResult result) {
        String requestId = findRequestId("suggestion_search");
        if (requestId == null) return;

        Promise promise = pendingPromises.remove(requestId);
        requestTypes.remove(requestId);

        if (promise == null) return;

        WritableMap resultMap = Arguments.createMap();
        
        if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
            resultMap.putBoolean("success", false);
            WritableMap error = Arguments.createMap();
            error.putString("code", "SUGGESTION_SEARCH_ERROR");
            error.putString("message", getErrorMessage(result != null ? result.error : null));
            resultMap.putMap("error", error);
        } else {
            resultMap.putBoolean("success", true);
            
            WritableArray suggestionList = Arguments.createArray();
            if (result.getAllSuggestions() != null) {
                for (com.baidu.mapapi.search.sug.SuggestionInfo suggestion : result.getAllSuggestions()) {
                    WritableMap suggestionData = Arguments.createMap();
                    suggestionData.putString("key", suggestion.key != null ? suggestion.key : "");
                    suggestionData.putString("city", suggestion.city != null ? suggestion.city : "");
                    suggestionData.putString("district", suggestion.district != null ? suggestion.district : "");
                    suggestionData.putString("uid", suggestion.uid != null ? suggestion.uid : "");
                    
                    if (suggestion.pt != null) {
                        WritableMap pt = Arguments.createMap();
                        pt.putDouble("latitude", suggestion.pt.latitude);
                        pt.putDouble("longitude", suggestion.pt.longitude);
                        suggestionData.putMap("pt", pt);
                    }
                    
                    suggestionList.pushMap(suggestionData);
                }
            }
            
            resultMap.putArray("data", suggestionList);
        }
        
        promise.resolve(resultMap);
    }

    // 其他必需的回调方法
    @Override
    public void onGetPoiDetailResult(PoiDetailResult result) {
        // 暂不实现
    }

    @Override
    public void onGetPoiIndoorResult(PoiIndoorResult result) {
        // 暂不实现
    }

    // 辅助方法
    private String findRequestId(String... types) {
        for (Map.Entry<String, String> entry : requestTypes.entrySet()) {
            for (String type : types) {
                if (type.equals(entry.getValue())) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    private String getErrorMessage(SearchResult.ERRORNO error) {
        if (error == null) {
            return "未知错误";
        }
        
        switch (error) {
            case AMBIGUOUS_KEYWORD:
                return "检索词有歧义";
            case AMBIGUOUS_ROURE_ADDR:
                return "检索地址有歧义";
            case NOT_SUPPORT_BUS:
                return "该城市不支持公交搜索";
            case NOT_SUPPORT_BUS_2CITY:
                return "不支持跨城市公交";
            case RESULT_NOT_FOUND:
                return "没有找到检索结果";
            case ST_TIMEOUT:
                return "搜索超时";
            case NETWORK_ERROR:
                return "网络连接错误";
            case NETWORK_TIMEOUT:
                return "网络连接超时";
            case PERMISSION_UNFINISHED:
                return "还未完成鉴权，请在鉴权通过后重试";
            default:
                return "搜索失败: " + error.name();
        }
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        
        if (geoCoder != null) {
            geoCoder.destroy();
            geoCoder = null;
        }
        
        if (poiSearch != null) {
            poiSearch.destroy();
            poiSearch = null;
        }
        
        if (suggestionSearch != null) {
            suggestionSearch.destroy();
            suggestionSearch = null;
        }
        
        pendingPromises.clear();
        requestTypes.clear();
    }
}