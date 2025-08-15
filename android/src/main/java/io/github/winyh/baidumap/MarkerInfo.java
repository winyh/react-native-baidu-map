package io.github.winyh.baidumap;

import com.facebook.react.bridge.ReadableMap;

public class MarkerInfo {
    private String markerId;
    private double latitude;
    private double longitude;
    private String title;
    private String description;
    private String iconUri;
    private boolean draggable;
    private boolean visible;
    private float alpha;
    private float rotation;
    private boolean flat;
    private int zIndex;

    public MarkerInfo(String markerId, ReadableMap options) {
        this.markerId = markerId;
        this.visible = true;
        this.alpha = 1.0f;
        this.rotation = 0.0f;
        this.flat = false;
        this.zIndex = 0;
        this.draggable = false;
        
        updateFromReadableMap(options);
    }

    public void updateFromReadableMap(ReadableMap options) {
        if (options == null) return;

        // 坐标信息
        if (options.hasKey("coordinate")) {
            ReadableMap coordinate = options.getMap("coordinate");
            if (coordinate != null) {
                if (coordinate.hasKey("latitude")) {
                    this.latitude = coordinate.getDouble("latitude");
                }
                if (coordinate.hasKey("longitude")) {
                    this.longitude = coordinate.getDouble("longitude");
                }
            }
        }

        // 标题和描述
        if (options.hasKey("title")) {
            this.title = options.getString("title");
        }

        if (options.hasKey("description")) {
            this.description = options.getString("description");
        }

        // 图标
        if (options.hasKey("icon")) {
            Object icon = options.getDynamic("icon").asString();
            if (icon instanceof String) {
                this.iconUri = (String) icon;
            } else if (options.getMap("icon") != null) {
                // 处理 ImageSource 对象或其他 Map 类型的图标
                ReadableMap iconMap = options.getMap("icon");
                if (iconMap.hasKey("uri")) {
                    this.iconUri = iconMap.getString("uri");
                } else if (iconMap.hasKey("url")) {
                    this.iconUri = iconMap.getString("url");
                }
            }
        }

        // 拖拽
        if (options.hasKey("draggable")) {
            this.draggable = options.getBoolean("draggable");
        }

        // 可见性
        if (options.hasKey("visible")) {
            this.visible = options.getBoolean("visible");
        }

        // 透明度
        if (options.hasKey("alpha")) {
            this.alpha = (float) options.getDouble("alpha");
            this.alpha = Math.max(0.0f, Math.min(1.0f, this.alpha));
        }

        // 旋转角度
        if (options.hasKey("rotation")) {
            this.rotation = (float) options.getDouble("rotation");
        }

        // 是否平贴地面
        if (options.hasKey("flat")) {
            this.flat = options.getBoolean("flat");
        }

        // Z轴顺序
        if (options.hasKey("zIndex")) {
            this.zIndex = options.getInt("zIndex");
        }
    }

    // Getters and Setters
    public String getMarkerId() {
        return markerId;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIconUri() {
        return iconUri;
    }

    public void setIconUri(String iconUri) {
        this.iconUri = iconUri;
    }

    public boolean isDraggable() {
        return draggable;
    }

    public void setDraggable(boolean draggable) {
        this.draggable = draggable;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public float getAlpha() {
        return alpha;
    }

    public void setAlpha(float alpha) {
        this.alpha = Math.max(0.0f, Math.min(1.0f, alpha));
    }

    public float getRotation() {
        return rotation;
    }

    public void setRotation(float rotation) {
        this.rotation = rotation;
    }

    public boolean isFlat() {
        return flat;
    }

    public void setFlat(boolean flat) {
        this.flat = flat;
    }

    public int getZIndex() {
        return zIndex;
    }

    public void setZIndex(int zIndex) {
        this.zIndex = zIndex;
    }

    @Override
    public String toString() {
        return "MarkerInfo{" +
                "markerId='" + markerId + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", iconUri='" + iconUri + '\'' +
                ", draggable=" + draggable +
                ", visible=" + visible +
                ", alpha=" + alpha +
                ", rotation=" + rotation +
                ", flat=" + flat +
                ", zIndex=" + zIndex +
                '}';
    }
}