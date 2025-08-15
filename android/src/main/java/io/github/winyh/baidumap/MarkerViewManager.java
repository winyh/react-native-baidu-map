package io.github.winyh.baidumap;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

public class MarkerViewManager extends SimpleViewManager<MarkerView> {
    public static final String REACT_CLASS = "BaiduMapMarker";

    private ReactApplicationContext reactContext;

    public MarkerViewManager(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected MarkerView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new MarkerView(reactContext);
    }

    @ReactProp(name = "coordinate")
    public void setCoordinate(MarkerView view, @Nullable ReadableMap coordinate) {
        if (coordinate != null && coordinate.hasKey("latitude") && coordinate.hasKey("longitude")) {
            double latitude = coordinate.getDouble("latitude");
            double longitude = coordinate.getDouble("longitude");
            view.setCoordinate(latitude, longitude);
        }
    }

    @ReactProp(name = "title")
    public void setTitle(MarkerView view, @Nullable String title) {
        view.setTitle(title);
    }

    @ReactProp(name = "description")
    public void setDescription(MarkerView view, @Nullable String description) {
        view.setDescription(description);
    }

    @ReactProp(name = "icon")
    public void setIcon(MarkerView view, @Nullable String icon) {
        view.setIcon(icon);
    }

    @ReactProp(name = "draggable")
    public void setDraggable(MarkerView view, boolean draggable) {
        view.setDraggable(draggable);
    }

    @ReactProp(name = "visible")
    public void setVisible(MarkerView view, boolean visible) {
        view.setVisible(visible);
    }

    @ReactProp(name = "alpha")
    public void setAlpha(MarkerView view, float alpha) {
        view.setAlpha(alpha);
    }

    @ReactProp(name = "rotation")
    public void setRotation(MarkerView view, float rotation) {
        view.setRotation(rotation);
    }

    @ReactProp(name = "flat")
    public void setFlat(MarkerView view, boolean flat) {
        view.setFlat(flat);
    }

    @ReactProp(name = "zIndex")
    public void setZIndex(MarkerView view, int zIndex) {
        view.setZIndex(zIndex);
    }

    @Override
    public void onDropViewInstance(@NonNull MarkerView view) {
        view.onDestroy();
        super.onDropViewInstance(view);
    }

    @Override
    public void onAfterUpdateTransaction(@NonNull MarkerView view) {
        super.onAfterUpdateTransaction(view);
        view.onAfterUpdateTransaction();
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
            .put("onPress", MapBuilder.of("registrationName", "onPress"))
            .put("onDragStart", MapBuilder.of("registrationName", "onDragStart"))
            .put("onDrag", MapBuilder.of("registrationName", "onDrag"))
            .put("onDragEnd", MapBuilder.of("registrationName", "onDragEnd"))
            .build();
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return MapBuilder.<String, Object>builder()
            .put("DEFAULT_ALPHA", 1.0f)
            .put("MIN_ALPHA", 0.0f)
            .put("MAX_ALPHA", 1.0f)
            .put("DEFAULT_ROTATION", 0.0f)
            .put("DEFAULT_Z_INDEX", 0)
            .build();
    }
}