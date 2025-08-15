package io.github.winyh.baidumap;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

public class BaiduMapViewManager extends SimpleViewManager<BaiduMapView> {
    public static final String REACT_CLASS = "BaiduMapView";

    private ReactApplicationContext reactContext;

    public BaiduMapViewManager(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected BaiduMapView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new BaiduMapView(reactContext);
    }

    @ReactProp(name = "center")
    public void setCenter(BaiduMapView view, @Nullable ReadableMap center) {
        if (center != null && center.hasKey("latitude") && center.hasKey("longitude")) {
            double latitude = center.getDouble("latitude");
            double longitude = center.getDouble("longitude");
            view.setCenter(latitude, longitude);
        }
    }

    @ReactProp(name = "zoom")
    public void setZoom(BaiduMapView view, float zoom) {
        view.setZoom(zoom);
    }

    @ReactProp(name = "mapType")
    public void setMapType(BaiduMapView view, @Nullable String mapType) {
        if (mapType != null) {
            view.setMapType(mapType);
        }
    }

    @ReactProp(name = "showsUserLocation")
    public void setShowsUserLocation(BaiduMapView view, boolean showsUserLocation) {
        view.setShowsUserLocation(showsUserLocation);
    }

    @ReactProp(name = "userLocationAccuracyCircleEnabled")
    public void setUserLocationAccuracyCircleEnabled(BaiduMapView view, boolean enabled) {
        view.setUserLocationAccuracyCircleEnabled(enabled);
    }

    @ReactProp(name = "zoomControlsEnabled")
    public void setZoomControlsEnabled(BaiduMapView view, boolean enabled) {
        view.setZoomControlsEnabled(enabled);
    }

    @ReactProp(name = "compassEnabled")
    public void setCompassEnabled(BaiduMapView view, boolean enabled) {
        view.setCompassEnabled(enabled);
    }

    @ReactProp(name = "scaleControlEnabled")
    public void setScaleControlEnabled(BaiduMapView view, boolean enabled) {
        view.setScaleControlEnabled(enabled);
    }

    @ReactProp(name = "rotateGesturesEnabled")
    public void setRotateGesturesEnabled(BaiduMapView view, boolean enabled) {
        view.setRotateGesturesEnabled(enabled);
    }

    @ReactProp(name = "scrollGesturesEnabled")
    public void setScrollGesturesEnabled(BaiduMapView view, boolean enabled) {
        view.setScrollGesturesEnabled(enabled);
    }

    @ReactProp(name = "zoomGesturesEnabled")
    public void setZoomGesturesEnabled(BaiduMapView view, boolean enabled) {
        view.setZoomGesturesEnabled(enabled);
    }

    @ReactProp(name = "overlookGesturesEnabled")
    public void setOverlookGesturesEnabled(BaiduMapView view, boolean enabled) {
        view.setOverlookGesturesEnabled(enabled);
    }

    @ReactProp(name = "trafficEnabled")
    public void setTrafficEnabled(BaiduMapView view, boolean enabled) {
        view.setTrafficEnabled(enabled);
    }

    @ReactProp(name = "buildingsEnabled")
    public void setBuildingsEnabled(BaiduMapView view, boolean enabled) {
        view.setBuildingsEnabled(enabled);
    }

    @ReactProp(name = "mapPadding")
    public void setMapPadding(BaiduMapView view, @Nullable ReadableMap padding) {
        if (padding != null) {
            int left = padding.hasKey("left") ? (int) padding.getDouble("left") : 0;
            int top = padding.hasKey("top") ? (int) padding.getDouble("top") : 0;
            int right = padding.hasKey("right") ? (int) padding.getDouble("right") : 0;
            int bottom = padding.hasKey("bottom") ? (int) padding.getDouble("bottom") : 0;
            view.setMapPadding(left, top, right, bottom);
        }
    }

    @ReactProp(name = "minZoomLevel")
    public void setMinZoomLevel(BaiduMapView view, float minZoom) {
        view.setMinZoomLevel(minZoom);
    }

    @ReactProp(name = "maxZoomLevel")
    public void setMaxZoomLevel(BaiduMapView view, float maxZoom) {
        view.setMaxZoomLevel(maxZoom);
    }

    @ReactProp(name = "region")
    public void setRegion(BaiduMapView view, @Nullable ReadableMap region) {
        if (region != null && region.hasKey("latitude") && region.hasKey("longitude") 
            && region.hasKey("latitudeDelta") && region.hasKey("longitudeDelta")) {
            double latitude = region.getDouble("latitude");
            double longitude = region.getDouble("longitude");
            double latitudeDelta = region.getDouble("latitudeDelta");
            double longitudeDelta = region.getDouble("longitudeDelta");
            view.setRegion(latitude, longitude, latitudeDelta, longitudeDelta);
        }
    }

    @Override
    public void onDropViewInstance(@NonNull BaiduMapView view) {
        view.onDestroy();
        super.onDropViewInstance(view);
    }

    @Override
    public void onAfterUpdateTransaction(@NonNull BaiduMapView view) {
        super.onAfterUpdateTransaction(view);
        view.onAfterUpdateTransaction();
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
            .put("onMapReady", MapBuilder.of("registrationName", "onMapReady"))
            .put("onMapClick", MapBuilder.of("registrationName", "onMapClick"))
            .put("onMapLongClick", MapBuilder.of("registrationName", "onMapLongClick"))
            .put("onMapStatusChange", MapBuilder.of("registrationName", "onMapStatusChange"))
            .put("onMapLoaded", MapBuilder.of("registrationName", "onMapLoaded"))
            .put("onMapError", MapBuilder.of("registrationName", "onMapError"))
            .put("onUserLocationUpdate", MapBuilder.of("registrationName", "onUserLocationUpdate"))
            .put("onInfoWindowShow", MapBuilder.of("registrationName", "onInfoWindowShow"))
            .put("onInfoWindowHide", MapBuilder.of("registrationName", "onInfoWindowHide"))
            .put("onInfoWindowPress", MapBuilder.of("registrationName", "onInfoWindowPress"))
            .put("onMarkerPress", MapBuilder.of("registrationName", "onMarkerPress"))
            .put("onMarkerDragStart", MapBuilder.of("registrationName", "onMarkerDragStart"))
            .put("onMarkerDrag", MapBuilder.of("registrationName", "onMarkerDrag"))
            .put("onMarkerDragEnd", MapBuilder.of("registrationName", "onMarkerDragEnd"))
            .build();
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return MapBuilder.<String, Object>builder()
            .put("MAP_TYPE_NORMAL", BaiduMapConfig.MAP_TYPE_NORMAL)
            .put("MAP_TYPE_SATELLITE", BaiduMapConfig.MAP_TYPE_SATELLITE)
            .put("MAP_TYPE_HYBRID", BaiduMapConfig.MAP_TYPE_HYBRID)
            .put("MIN_ZOOM_LEVEL", 3.0f)
            .put("MAX_ZOOM_LEVEL", 21.0f)
            .build();
    }
}