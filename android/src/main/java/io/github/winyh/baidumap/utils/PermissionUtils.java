package io.github.winyh.baidumap.utils;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

public class PermissionUtils {
    
    // 定位相关权限
    public static final String[] LOCATION_PERMISSIONS = {
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    };
    
    // 存储权限
    public static final String[] STORAGE_PERMISSIONS = {
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.READ_EXTERNAL_STORAGE
    };
    
    // 网络权限
    public static final String[] NETWORK_PERMISSIONS = {
        Manifest.permission.ACCESS_NETWORK_STATE,
        Manifest.permission.ACCESS_WIFI_STATE,
        Manifest.permission.CHANGE_WIFI_STATE,
        Manifest.permission.INTERNET
    };
    
    // 其他权限
    public static final String[] OTHER_PERMISSIONS = {
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.WAKE_LOCK,
        Manifest.permission.VIBRATE
    };

    /**
     * 检查是否有定位权限
     */
    public static boolean hasLocationPermission(Context context) {
        return hasPermissions(context, LOCATION_PERMISSIONS);
    }

    /**
     * 检查是否有存储权限
     */
    public static boolean hasStoragePermission(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10+ 不需要存储权限
            return true;
        }
        return hasPermissions(context, STORAGE_PERMISSIONS);
    }

    /**
     * 检查是否有网络权限
     */
    public static boolean hasNetworkPermission(Context context) {
        return hasPermissions(context, NETWORK_PERMISSIONS);
    }

    /**
     * 检查是否有指定权限
     */
    public static boolean hasPermissions(Context context, String[] permissions) {
        if (context == null || permissions == null) {
            return false;
        }
        
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(context, permission) 
                != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    /**
     * 获取缺失的权限列表
     */
    public static String[] getMissingPermissions(Context context, String[] permissions) {
        if (context == null || permissions == null) {
            return new String[0];
        }
        
        List<String> missingPermissions = new ArrayList<>();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(context, permission) 
                != PackageManager.PERMISSION_GRANTED) {
                missingPermissions.add(permission);
            }
        }
        
        return missingPermissions.toArray(new String[0]);
    }

    /**
     * 请求权限
     */
    public static void requestPermissions(Activity activity, String[] permissions, int requestCode) {
        if (activity == null || permissions == null) {
            return;
        }
        
        String[] missingPermissions = getMissingPermissions(activity, permissions);
        if (missingPermissions.length > 0) {
            ActivityCompat.requestPermissions(activity, missingPermissions, requestCode);
        }
    }

    /**
     * 检查权限请求结果
     */
    public static boolean isPermissionGranted(int[] grantResults) {
        if (grantResults == null || grantResults.length == 0) {
            return false;
        }
        
        for (int result : grantResults) {
            if (result != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    /**
     * 是否应该显示权限说明
     */
    public static boolean shouldShowRequestPermissionRationale(Activity activity, String[] permissions) {
        if (activity == null || permissions == null) {
            return false;
        }
        
        for (String permission : permissions) {
            if (ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取权限状态描述
     */
    public static String getPermissionStatusDescription(Context context, String permission) {
        if (context == null || permission == null) {
            return "Unknown";
        }
        
        int status = ContextCompat.checkSelfPermission(context, permission);
        return status == PackageManager.PERMISSION_GRANTED ? "Granted" : "Denied";
    }
}