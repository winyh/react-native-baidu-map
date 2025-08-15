import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import {
  PermissionStatus,
  PermissionResult,
  BaiduMapError,
  BaiduMapErrorCode,
} from '../types';

/**
 * 权限管理工具类
 * 处理定位权限的检查、请求和状态管理
 */
export class PermissionManager {
  private static readonly LOCATION_PERMISSIONS = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ];

  private static readonly BACKGROUND_LOCATION_PERMISSION = 
    'android.permission.ACCESS_BACKGROUND_LOCATION';

  /**
   * 检查定位权限状态
   */
  static async checkLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      // iOS 权限处理在原生层完成
      return { status: PermissionStatus.GRANTED, canRequestAgain: false };
    }

    try {
      // 检查精确定位权限
      const fineLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (fineLocationGranted) {
        return { status: PermissionStatus.GRANTED, canRequestAgain: false };
      }

      // 检查粗略定位权限
      const coarseLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );

      if (coarseLocationGranted) {
        return { status: PermissionStatus.GRANTED, canRequestAgain: false };
      }

      // 检查是否可以请求权限
      const shouldShowRationale = await PermissionsAndroid.shouldShowRequestPermissionRationale(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return {
        status: PermissionStatus.DENIED,
        canRequestAgain: shouldShowRationale,
      };
    } catch (error) {
      console.error('检查定位权限失败:', error);
      return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
    }
  }

  /**
   * 请求定位权限
   */
  static async requestLocationPermission(showRationale: boolean = true): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return { status: PermissionStatus.GRANTED, canRequestAgain: false };
    }

    try {
      // 如果需要显示权限说明
      if (showRationale) {
        const shouldShow = await PermissionsAndroid.shouldShowRequestPermissionRationale(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (shouldShow) {
          const userChoice = await this.showPermissionRationale();
          if (!userChoice) {
            return { status: PermissionStatus.DENIED, canRequestAgain: true };
          }
        }
      }

      // 请求权限
      const results = await PermissionsAndroid.requestMultiple(this.LOCATION_PERMISSIONS);

      const fineLocationResult = results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      const coarseLocationResult = results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

      // 检查结果
      if (fineLocationResult === PermissionsAndroid.RESULTS.GRANTED ||
          coarseLocationResult === PermissionsAndroid.RESULTS.GRANTED) {
        return { status: PermissionStatus.GRANTED, canRequestAgain: false };
      }

      if (fineLocationResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
          coarseLocationResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        return { status: PermissionStatus.NEVER_ASK_AGAIN, canRequestAgain: false };
      }

      return { status: PermissionStatus.DENIED, canRequestAgain: true };
    } catch (error) {
      console.error('请求定位权限失败:', error);
      return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
    }
  }

  /**
   * 检查后台定位权限（Android 10+）
   */
  static async checkBackgroundLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android' || Platform.Version < 29) {
      return { status: PermissionStatus.GRANTED, canRequestAgain: false };
    }

    try {
      const granted = await PermissionsAndroid.check(this.BACKGROUND_LOCATION_PERMISSION);
      
      if (granted) {
        return { status: PermissionStatus.GRANTED, canRequestAgain: false };
      }

      const shouldShow = await PermissionsAndroid.shouldShowRequestPermissionRationale(
        this.BACKGROUND_LOCATION_PERMISSION
      );

      return {
        status: PermissionStatus.DENIED,
        canRequestAgain: shouldShow,
      };
    } catch (error) {
      console.error('检查后台定位权限失败:', error);
      return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
    }
  }

  /**
   * 请求后台定位权限（Android 10+）
   */
  static async requestBackgroundLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS !== 'android' || Platform.Version < 29) {
      return { status: PermissionStatus.GRANTED, canRequestAgain: false };
    }

    try {
      // 首先确保前台定位权限已获取
      const foregroundResult = await this.checkLocationPermission();
      if (foregroundResult.status !== PermissionStatus.GRANTED) {
        return {
          status: PermissionStatus.DENIED,
          canRequestAgain: true,
        };
      }

      // 显示后台定位权限说明
      const userChoice = await this.showBackgroundLocationRationale();
      if (!userChoice) {
        return { status: PermissionStatus.DENIED, canRequestAgain: true };
      }

      // 请求后台定位权限
      const result = await PermissionsAndroid.request(this.BACKGROUND_LOCATION_PERMISSION);

      switch (result) {
        case PermissionsAndroid.RESULTS.GRANTED:
          return { status: PermissionStatus.GRANTED, canRequestAgain: false };
        case PermissionsAndroid.RESULTS.DENIED:
          return { status: PermissionStatus.DENIED, canRequestAgain: true };
        case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
          return { status: PermissionStatus.NEVER_ASK_AGAIN, canRequestAgain: false };
        default:
          return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
      }
    } catch (error) {
      console.error('请求后台定位权限失败:', error);
      return { status: PermissionStatus.UNKNOWN, canRequestAgain: true };
    }
  }

  /**
   * 显示权限说明对话框
   */
  private static showPermissionRationale(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '定位权限',
        '应用需要访问您的位置信息以提供地图服务和位置相关功能。请允许定位权限以获得最佳体验。',
        [
          {
            text: '拒绝',
            onPress: () => resolve(false),
            style: 'cancel',
          },
          {
            text: '允许',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * 显示后台定位权限说明对话框
   */
  private static showBackgroundLocationRationale(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '后台定位权限',
        '为了在应用后台运行时继续提供位置服务，需要授予"始终允许"定位权限。这将帮助应用在后台时也能获取位置信息。',
        [
          {
            text: '取消',
            onPress: () => resolve(false),
            style: 'cancel',
          },
          {
            text: '去设置',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * 显示权限被拒绝的处理指导
   */
  static showPermissionDeniedGuidance(isNeverAskAgain: boolean = false): Promise<boolean> {
    const title = '定位权限被拒绝';
    const message = isNeverAskAgain
      ? '定位权限已被永久拒绝，请前往系统设置手动开启定位权限以使用地图功能。'
      : '定位权限被拒绝，部分功能可能无法正常使用。您可以重新授权或前往设置开启权限。';

    const buttons = isNeverAskAgain
      ? [
          { text: '取消', onPress: () => Promise.resolve(false), style: 'cancel' as const },
          { text: '去设置', onPress: () => Promise.resolve(true) },
        ]
      : [
          { text: '取消', onPress: () => Promise.resolve(false), style: 'cancel' as const },
          { text: '重新授权', onPress: () => Promise.resolve(true) },
        ];

    return new Promise((resolve) => {
      Alert.alert(title, message, buttons.map(button => ({
        ...button,
        onPress: () => resolve(button.onPress()),
      })), { cancelable: false });
    });
  }

  /**
   * 打开应用设置页面
   */
  static async openAppSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('打开应用设置失败:', error);
      Alert.alert('错误', '无法打开应用设置，请手动前往系统设置开启权限。');
    }
  }

  /**
   * 检查定位服务是否开启
   */
  static async isLocationServiceEnabled(): Promise<boolean> {
    // 这个功能需要原生模块支持
    try {
      const { BaiduMapModule } = require('react-native').NativeModules;
      if (BaiduMapModule && BaiduMapModule.isLocationServiceEnabled) {
        const result = await BaiduMapModule.isLocationServiceEnabled();
        return result.success && result.data;
      }
    } catch (error) {
      console.warn('检查定位服务状态失败:', error);
    }
    return true; // 默认认为已开启
  }

  /**
   * 显示定位服务未开启的提示
   */
  static showLocationServiceDisabledAlert(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '定位服务未开启',
        '请在系统设置中开启定位服务以使用地图功能。',
        [
          {
            text: '取消',
            onPress: () => resolve(false),
            style: 'cancel',
          },
          {
            text: '去设置',
            onPress: () => {
              this.openLocationSettings();
              resolve(true);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * 打开定位设置页面
   */
  static async openLocationSettings(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      } else {
        await Linking.openURL('App-Prefs:Privacy&path=LOCATION');
      }
    } catch (error) {
      console.error('打开定位设置失败:', error);
      // 降级到通用设置页面
      await this.openAppSettings();
    }
  }

  /**
   * 获取权限状态的描述文本
   */
  static getPermissionStatusDescription(status: PermissionStatus): string {
    switch (status) {
      case PermissionStatus.GRANTED:
        return '已授权';
      case PermissionStatus.DENIED:
        return '已拒绝';
      case PermissionStatus.NEVER_ASK_AGAIN:
        return '永久拒绝';
      case PermissionStatus.UNKNOWN:
        return '未知状态';
      default:
        return '未知状态';
    }
  }

  /**
   * 完整的权限检查和请求流程
   */
  static async ensureLocationPermission(showGuidance: boolean = true): Promise<PermissionResult> {
    // 1. 检查当前权限状态
    let result = await this.checkLocationPermission();
    
    if (result.status === PermissionStatus.GRANTED) {
      return result;
    }

    // 2. 如果权限被永久拒绝，显示指导
    if (result.status === PermissionStatus.NEVER_ASK_AGAIN) {
      if (showGuidance) {
        const userChoice = await this.showPermissionDeniedGuidance(true);
        if (userChoice) {
          await this.openAppSettings();
        }
      }
      return result;
    }

    // 3. 请求权限
    result = await this.requestLocationPermission(showGuidance);
    
    // 4. 如果权限被拒绝，显示指导
    if (result.status !== PermissionStatus.GRANTED && showGuidance) {
      const isNeverAskAgain = result.status === PermissionStatus.NEVER_ASK_AGAIN;
      const userChoice = await this.showPermissionDeniedGuidance(isNeverAskAgain);
      
      if (userChoice) {
        if (isNeverAskAgain) {
          await this.openAppSettings();
        } else {
          // 重新请求权限
          return await this.requestLocationPermission(false);
        }
      }
    }

    return result;
  }
}

export default PermissionManager;