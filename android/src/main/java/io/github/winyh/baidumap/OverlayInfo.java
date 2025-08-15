package io.github.winyh.baidumap;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;
import java.util.List;

public class OverlayInfo {
    private String overlayId;
    private String type; // "polyline", "polygon", "circle"
    private List<CoordinateInfo> coordinates;
    private CoordinateInfo center; // 用于圆形
    private int radius; // 用于圆形
    private String strokeColor;
    private int strokeWidth;
    private String fillColor;
    private List<Integer> strokePattern;
    private boolean visible;
    private int zIndex;

    public OverlayInfo(String overlayId, String type, ReadableMap options) {
        this.overlayId = overlayId;
        this.type = type;
        this.coordinates = new ArrayList<>();
        this.strokeColor = "#0000FF"; // 默认蓝色
        this.strokeWidth = 5;
        this.fillColor = "#800000FF"; // 默认半透明蓝色
        this.strokePattern = new ArrayList<>();
        this.visible = true;
        this.zIndex = 0;
        this.radius = 100; // 默认半径
        
        updateFromReadableMap(options);
    }

    public void updateFromReadableMap(ReadableMap options) {
        if (options == null) return;

        // 坐标信息
        if (options.hasKey("coordinates")) {
            ReadableArray coordArray = options.getArray("coordinates");
            parseCoordinates(coordArray);
        }

        // 圆形中心点
        if (options.hasKey("center")) {
            ReadableMap centerMap = options.getMap("center");
            if (centerMap != null && centerMap.hasKey("latitude") && centerMap.hasKey("longitude")) {
                this.center = new CoordinateInfo(
                    centerMap.getDouble("latitude"),
                    centerMap.getDouble("longitude")
                );
            }
        }

        // 圆形半径
        if (options.hasKey("radius")) {
            this.radius = options.getInt("radius");
        }

        // 线条颜色
        if (options.hasKey("strokeColor")) {
            this.strokeColor = options.getString("strokeColor");
        }

        // 线条宽度
        if (options.hasKey("strokeWidth")) {
            this.strokeWidth = options.getInt("strokeWidth");
        }

        // 填充颜色
        if (options.hasKey("fillColor")) {
            this.fillColor = options.getString("fillColor");
        }

        // 虚线样式
        if (options.hasKey("strokePattern")) {
            ReadableArray patternArray = options.getArray("strokePattern");
            parseStrokePattern(patternArray);
        }

        // 可见性
        if (options.hasKey("visible")) {
            this.visible = options.getBoolean("visible");
        }

        // Z轴顺序
        if (options.hasKey("zIndex")) {
            this.zIndex = options.getInt("zIndex");
        }
    }

    /**
     * 解析坐标数组
     */
    private void parseCoordinates(ReadableArray coordArray) {
        coordinates.clear();
        
        if (coordArray != null) {
            for (int i = 0; i < coordArray.size(); i++) {
                ReadableMap coord = coordArray.getMap(i);
                if (coord != null && coord.hasKey("latitude") && coord.hasKey("longitude")) {
                    double lat = coord.getDouble("latitude");
                    double lng = coord.getDouble("longitude");
                    coordinates.add(new CoordinateInfo(lat, lng));
                }
            }
        }
    }

    /**
     * 解析虚线样式
     */
    private void parseStrokePattern(ReadableArray patternArray) {
        strokePattern.clear();
        
        if (patternArray != null) {
            for (int i = 0; i < patternArray.size(); i++) {
                strokePattern.add(patternArray.getInt(i));
            }
        }
    }

    // Getters and Setters
    public String getOverlayId() {
        return overlayId;
    }

    public String getType() {
        return type;
    }

    public List<CoordinateInfo> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<CoordinateInfo> coordinates) {
        this.coordinates = coordinates;
    }

    public CoordinateInfo getCenter() {
        return center;
    }

    public void setCenter(CoordinateInfo center) {
        this.center = center;
    }

    public int getRadius() {
        return radius;
    }

    public void setRadius(int radius) {
        this.radius = radius;
    }

    public String getStrokeColor() {
        return strokeColor;
    }

    public void setStrokeColor(String strokeColor) {
        this.strokeColor = strokeColor;
    }

    public int getStrokeWidth() {
        return strokeWidth;
    }

    public void setStrokeWidth(int strokeWidth) {
        this.strokeWidth = strokeWidth;
    }

    public String getFillColor() {
        return fillColor;
    }

    public void setFillColor(String fillColor) {
        this.fillColor = fillColor;
    }

    public List<Integer> getStrokePattern() {
        return strokePattern;
    }

    public void setStrokePattern(List<Integer> strokePattern) {
        this.strokePattern = strokePattern;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public int getZIndex() {
        return zIndex;
    }

    public void setZIndex(int zIndex) {
        this.zIndex = zIndex;
    }

    /**
     * 坐标信息类
     */
    public static class CoordinateInfo {
        private double latitude;
        private double longitude;

        public CoordinateInfo(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public double getLatitude() {
            return latitude;
        }

        public void setLatitude(double latitude) {
            this.latitude = latitude;
        }

        public double getLongitude() {
            return longitude;
        }

        public void setLongitude(double longitude) {
            this.longitude = longitude;
        }

        @Override
        public String toString() {
            return "CoordinateInfo{" +
                    "latitude=" + latitude +
                    ", longitude=" + longitude +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "OverlayInfo{" +
                "overlayId='" + overlayId + '\'' +
                ", type='" + type + '\'' +
                ", coordinates=" + coordinates.size() +
                ", center=" + center +
                ", radius=" + radius +
                ", strokeColor='" + strokeColor + '\'' +
                ", strokeWidth=" + strokeWidth +
                ", fillColor='" + fillColor + '\'' +
                ", visible=" + visible +
                ", zIndex=" + zIndex +
                '}';
    }
}