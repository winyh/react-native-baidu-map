import {
  BaiduMapError,
  BaiduMapErrorCode,
  MapMethodResult,
} from '../types';

/**
 * 错误处理系统
 * 提供统一的错误类型定义、错误码映射和错误处理最佳实践
 */
export class ErrorHandler {
  // 错误码到错误信息的映射
  private static readonly ERROR_MESSAGES: Partial<Record<BaiduMapErrorCode, string>> = {
    [BaiduMapErrorCode.SDK_NOT_INITIALIZED]: '百度地图SDK未初始化，请先调用初始化方法',
    [BaiduMapErrorCode.INVALID_API_KEY]: 'API Key无效或未设置，请检查API Key配置',
    [BaiduMapErrorCode.LOCATION_PERMISSION_DENIED]: '定位权限被拒绝，请在设置中开启定位权限',
    [BaiduMapErrorCode.LOCATION_SERVICE_DISABLED]: '定位服务未开启，请在系统设置中开启定位服务',
    [BaiduMapErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络连接状态',
    [BaiduMapErrorCode.UNKNOWN_ERROR]: '未知错误，请稍后重试',
    [BaiduMapErrorCode.INVALID_COORDINATE]: '坐标参数无效，请检查经纬度数值',
    [BaiduMapErrorCode.INVALID_PARAMETER]: '参数无效，请检查传入的参数',
  };

  // 错误码到用户友好提示的映射
  private static readonly USER_FRIENDLY_MESSAGES: Partial<Record<BaiduMapErrorCode, string>> = {
    [BaiduMapErrorCode.SDK_NOT_INITIALIZED]: '地图服务初始化失败，请重启应用',
    [BaiduMapErrorCode.INVALID_API_KEY]: '地图服务配置错误，请联系开发者',
    [BaiduMapErrorCode.LOCATION_PERMISSION_DENIED]: '需要定位权限才能使用此功能',
    [BaiduMapErrorCode.LOCATION_SERVICE_DISABLED]: '请开启手机定位服务',
    [BaiduMapErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络',
    [BaiduMapErrorCode.UNKNOWN_ERROR]: '操作失败，请稍后重试',
    [BaiduMapErrorCode.INVALID_COORDINATE]: '位置信息无效',
    [BaiduMapErrorCode.INVALID_PARAMETER]: '参数错误',
  };

  // 错误严重程度
  public static readonly ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const;

  // 错误码到严重程度的映射
  private static readonly ERROR_SEVERITY_MAP: Partial<Record<BaiduMapErrorCode, string>> = {
    [BaiduMapErrorCode.SDK_NOT_INITIALIZED]: ErrorHandler.ERROR_SEVERITY.CRITICAL,
    [BaiduMapErrorCode.INVALID_API_KEY]: ErrorHandler.ERROR_SEVERITY.CRITICAL,
    [BaiduMapErrorCode.LOCATION_PERMISSION_DENIED]: ErrorHandler.ERROR_SEVERITY.HIGH,
    [BaiduMapErrorCode.LOCATION_SERVICE_DISABLED]: ErrorHandler.ERROR_SEVERITY.HIGH,
    [BaiduMapErrorCode.NETWORK_ERROR]: ErrorHandler.ERROR_SEVERITY.MEDIUM,
    [BaiduMapErrorCode.UNKNOWN_ERROR]: ErrorHandler.ERROR_SEVERITY.MEDIUM,
    [BaiduMapErrorCode.INVALID_COORDINATE]: ErrorHandler.ERROR_SEVERITY.LOW,
    [BaiduMapErrorCode.INVALID_PARAMETER]: ErrorHandler.ERROR_SEVERITY.LOW,
  };

  /**
   * 创建标准化的错误对象
   */
  static createError(
    code: BaiduMapErrorCode,
    customMessage?: string,
    nativeError?: any
  ): BaiduMapError {
    return {
      code,
      message: customMessage || this.ERROR_MESSAGES[code] || '未知错误',
      nativeError,
    };
  }

  /**
   * 从原生错误转换为标准错误
   */
  static fromNativeError(nativeError: any): BaiduMapError {
    if (!nativeError) {
      return this.createError(BaiduMapErrorCode.UNKNOWN_ERROR);
    }

    // 如果已经是标准错误格式
    if (nativeError.code && Object.values(BaiduMapErrorCode).includes(nativeError.code)) {
      return {
        code: nativeError.code,
        message: nativeError.message || this.ERROR_MESSAGES[nativeError.code as BaiduMapErrorCode],
        nativeError: nativeError.nativeError,
      };
    }

    // 根据原生错误信息推断错误类型
    const errorMessage = nativeError.message || nativeError.toString() || '';
    const lowerMessage = errorMessage.toLowerCase();

    if (lowerMessage.includes('permission') || lowerMessage.includes('权限')) {
      return this.createError(BaiduMapErrorCode.LOCATION_PERMISSION_DENIED, errorMessage, nativeError);
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('网络')) {
      return this.createError(BaiduMapErrorCode.NETWORK_ERROR, errorMessage, nativeError);
    }

    if (lowerMessage.includes('api key') || lowerMessage.includes('apikey')) {
      return this.createError(BaiduMapErrorCode.INVALID_API_KEY, errorMessage, nativeError);
    }

    if (lowerMessage.includes('coordinate') || lowerMessage.includes('坐标')) {
      return this.createError(BaiduMapErrorCode.INVALID_COORDINATE, errorMessage, nativeError);
    }

    if (lowerMessage.includes('parameter') || lowerMessage.includes('参数')) {
      return this.createError(BaiduMapErrorCode.INVALID_PARAMETER, errorMessage, nativeError);
    }

    // 默认为未知错误
    return this.createError(BaiduMapErrorCode.UNKNOWN_ERROR, errorMessage, nativeError);
  }

  /**
   * 获取用户友好的错误信息
   */
  static getUserFriendlyMessage(error: BaiduMapError): string {
    return this.USER_FRIENDLY_MESSAGES[error.code] || error.message || '操作失败';
  }

  /**
   * 获取错误的严重程度
   */
  static getErrorSeverity(error: BaiduMapError): string {
    return this.ERROR_SEVERITY_MAP[error.code] || this.ERROR_SEVERITY.MEDIUM;
  }

  /**
   * 判断错误是否可重试
   */
  static isRetryableError(error: BaiduMapError): boolean {
    const retryableCodes = [
      BaiduMapErrorCode.NETWORK_ERROR,
      BaiduMapErrorCode.UNKNOWN_ERROR,
    ];
    return retryableCodes.includes(error.code);
  }

  /**
   * 判断错误是否需要用户干预
   */
  static requiresUserAction(error: BaiduMapError): boolean {
    const userActionCodes = [
      BaiduMapErrorCode.LOCATION_PERMISSION_DENIED,
      BaiduMapErrorCode.LOCATION_SERVICE_DISABLED,
      BaiduMapErrorCode.INVALID_API_KEY,
    ];
    return userActionCodes.includes(error.code);
  }

  /**
   * 获取错误的解决建议
   */
  static getResolutionSuggestion(error: BaiduMapError): string {
    const suggestions: Partial<Record<BaiduMapErrorCode, string>> = {
      [BaiduMapErrorCode.SDK_NOT_INITIALIZED]: '请重启应用或联系开发者',
      [BaiduMapErrorCode.INVALID_API_KEY]: '请联系开发者检查API Key配置',
      [BaiduMapErrorCode.LOCATION_PERMISSION_DENIED]: '请前往设置开启定位权限',
      [BaiduMapErrorCode.LOCATION_SERVICE_DISABLED]: '请前往系统设置开启定位服务',
      [BaiduMapErrorCode.NETWORK_ERROR]: '请检查网络连接后重试',
      [BaiduMapErrorCode.UNKNOWN_ERROR]: '请稍后重试，如问题持续请联系开发者',
      [BaiduMapErrorCode.INVALID_COORDINATE]: '请检查坐标参数是否正确',
      [BaiduMapErrorCode.INVALID_PARAMETER]: '请检查传入的参数是否正确',
    };

    return suggestions[error.code] || '请稍后重试';
  }

  /**
   * 包装异步方法，提供统一的错误处理
   */
  static async wrapAsyncMethod<T>(
    method: () => Promise<T>,
    errorContext?: string
  ): Promise<MapMethodResult<T>> {
    try {
      const result = await method();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const baiduError = this.fromNativeError(error);
      
      // 添加上下文信息
      if (errorContext) {
        baiduError.message = `${errorContext}: ${baiduError.message}`;
      }

      return {
        success: false,
        error: baiduError,
      };
    }
  }

  /**
   * 重试机制
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    shouldRetry?: (error: BaiduMapError) => boolean
  ): Promise<MapMethodResult<T>> {
    let lastError: BaiduMapError | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        lastError = this.fromNativeError(error);

        // 检查是否应该重试
        const canRetry = shouldRetry ? shouldRetry(lastError) : this.isRetryableError(lastError);
        
        if (!canRetry || attempt === maxRetries) {
          break;
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    return {
      success: false,
      error: lastError || this.createError(BaiduMapErrorCode.UNKNOWN_ERROR),
    };
  }

  /**
   * 错误日志记录
   */
  static logError(error: BaiduMapError, context?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      code: error.code,
      message: error.message,
      context,
      severity: this.getErrorSeverity(error),
      nativeError: error.nativeError,
    };

    // 根据严重程度选择日志级别
    const severity = this.getErrorSeverity(error);
    switch (severity) {
      case this.ERROR_SEVERITY.CRITICAL:
        console.error('[BaiduMap CRITICAL]', logData);
        break;
      case this.ERROR_SEVERITY.HIGH:
        console.error('[BaiduMap ERROR]', logData);
        break;
      case this.ERROR_SEVERITY.MEDIUM:
        console.warn('[BaiduMap WARNING]', logData);
        break;
      case this.ERROR_SEVERITY.LOW:
        console.info('[BaiduMap INFO]', logData);
        break;
      default:
        console.log('[BaiduMap]', logData);
    }
  }

  /**
   * 创建错误报告
   */
  static createErrorReport(error: BaiduMapError, context?: any): {
    error: BaiduMapError;
    context?: any;
    timestamp: string;
    severity: string;
    userFriendlyMessage: string;
    resolutionSuggestion: string;
    isRetryable: boolean;
    requiresUserAction: boolean;
  } {
    return {
      error,
      context,
      timestamp: new Date().toISOString(),
      severity: this.getErrorSeverity(error),
      userFriendlyMessage: this.getUserFriendlyMessage(error),
      resolutionSuggestion: this.getResolutionSuggestion(error),
      isRetryable: this.isRetryableError(error),
      requiresUserAction: this.requiresUserAction(error),
    };
  }

  /**
   * 批量错误处理
   */
  static handleBatchErrors(
    results: Array<MapMethodResult<any>>,
    onError?: (error: BaiduMapError, index: number) => void
  ): {
    successCount: number;
    errorCount: number;
    errors: Array<{ index: number; error: BaiduMapError }>;
  } {
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ index: number; error: BaiduMapError }> = [];

    results.forEach((result, index) => {
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        if (result.error) {
          errors.push({ index, error: result.error });
          if (onError) {
            onError(result.error, index);
          }
        }
      }
    });

    return { successCount, errorCount, errors };
  }

  /**
   * 错误恢复策略
   */
  static getRecoveryStrategy(error: BaiduMapError): {
    strategy: 'retry' | 'user_action' | 'fallback' | 'ignore';
    description: string;
    action?: () => void;
  } {
    switch (error.code) {
      case BaiduMapErrorCode.NETWORK_ERROR:
        return {
          strategy: 'retry',
          description: '网络错误，建议重试',
        };

      case BaiduMapErrorCode.LOCATION_PERMISSION_DENIED:
        return {
          strategy: 'user_action',
          description: '需要用户授权定位权限',
        };

      case BaiduMapErrorCode.LOCATION_SERVICE_DISABLED:
        return {
          strategy: 'user_action',
          description: '需要用户开启定位服务',
        };

      case BaiduMapErrorCode.SDK_NOT_INITIALIZED:
        return {
          strategy: 'fallback',
          description: 'SDK未初始化，尝试重新初始化',
        };

      case BaiduMapErrorCode.INVALID_COORDINATE:
      case BaiduMapErrorCode.INVALID_PARAMETER:
        return {
          strategy: 'ignore',
          description: '参数错误，忽略此次操作',
        };

      default:
        return {
          strategy: 'retry',
          description: '未知错误，尝试重试',
        };
    }
  }
}

export default ErrorHandler;