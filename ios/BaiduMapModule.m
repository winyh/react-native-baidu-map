#import "BaiduMapModule.h"
#import <React/RCTLog.h>
#import <BaiduMapAPI_Base/BMKBaseComponent.h>
#import <BaiduMapAPI_Map/BMKMapComponent.h>
#import <BaiduMapAPI_Search/BMKSearchComponent.h>
#import <BaiduMapAPI_Utils/BMKUtilsComponent.h>
#import <BMKLocationKit/BMKLocationComponent.h>

@interface BaiduMapModule() <BMKGeneralDelegate, BMKLocationManagerDelegate>
@property (nonatomic, strong) BMKMapManager *mapManager;
@property (nonatomic, strong) BMKLocationManager *locationManager;
@property (nonatomic, assign) BOOL isSDKInitialized;
@property (nonatomic, copy) RCTPromiseResolveBlock locationResolve;
@property (nonatomic, copy) RCTPromiseRejectBlock locationReject;
@end

@implementation BaiduMapModule

RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _isSDKInitialized = NO;
        _mapManager = [[BMKMapManager alloc] init];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_METHOD(initSDK:(NSString *)apiKey
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.isSDKInitialized) {
        resolve(@{@"success": @YES, @"message": @"SDK已经初始化"});
        return;
    }
    
    RCTLogInfo(@"初始化百度地图SDK，API Key: %@", apiKey);
    
    // 设置坐标系类型
    BOOL ret = [BMKMapManager setCoordinateTypeUsedInBaiduMapSDK:BMK_COORDTYPE_BD09LL];
    if (!ret) {
        reject(@"INIT_ERROR", @"坐标系设置失败", nil);
        return;
    }
    
    // 启动百度地图SDK
    self.mapManager.delegate = self;
    BOOL success = [self.mapManager start:apiKey generalDelegate:self];
    
    if (success) {
        self.isSDKInitialized = YES;
        
        // 初始化定位管理器
        [self initLocationManager];
        
        resolve(@{@"success": @YES, @"message": @"SDK初始化成功"});
        RCTLogInfo(@"百度地图SDK初始化成功");
    } else {
        reject(@"INIT_ERROR", @"SDK初始化失败，请检查API Key是否正确", nil);
        RCTLogError(@"百度地图SDK初始化失败");
    }
}

- (void)initLocationManager {
    self.locationManager = [[BMKLocationManager alloc] init];
    self.locationManager.delegate = self;
    self.locationManager.coordinateType = BMKLocationCoordinateTypeBMK09LL;
    self.locationManager.distanceFilter = kCLDistanceFilterNone;
    self.locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    self.locationManager.activityType = CLActivityTypeAutomotiveNavigation;
    self.locationManager.pausesLocationUpdatesAutomatically = NO;
    self.locationManager.allowsBackgroundLocationUpdates = NO;
    self.locationManager.locationTimeout = 10;
    self.locationManager.reGeocodeTimeout = 10;
}

RCT_EXPORT_METHOD(getSDKVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *version = [BMKMapManager getVersion];
    resolve(@{@"version": version ?: @"未知版本"});
}

RCT_EXPORT_METHOD(checkSDKStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(@{
        @"initialized": @(self.isSDKInitialized),
        @"version": [BMKMapManager getVersion] ?: @"未知版本"
    });
}

RCT_EXPORT_METHOD(setPrivacyPolicy:(BOOL)agreed
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [BMKMapManager setAgreePrivacy:agreed];
    resolve(@{@"success": @YES, @"agreed": @(agreed)});
}

RCT_EXPORT_METHOD(getCurrentLocation:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!self.isSDKInitialized) {
        reject(@"SDK_NOT_INITIALIZED", @"SDK未初始化", nil);
        return;
    }
    
    if (!self.locationManager) {
        reject(@"LOCATION_MANAGER_ERROR", @"定位管理器未初始化", nil);
        return;
    }
    
    RCTLogInfo(@"开始获取当前位置");
    
    // 保存回调
    self.locationResolve = resolve;
    self.locationReject = reject;
    
    // 单次定位
    [self.locationManager requestLocationWithReGeocode:YES 
                                       withNetworkState:YES 
                                        completionBlock:^(BMKLocation * _Nullable location, BMKLocationNetworkState state, NSError * _Nullable error) {
        [self handleLocationResult:location networkState:state error:error];
    }];
}

- (void)handleLocationResult:(BMKLocation *)location networkState:(BMKLocationNetworkState)state error:(NSError *)error {
    if (error) {
        NSString *errorMessage = [self getLocationErrorMessage:error];
        if (self.locationReject) {
            self.locationReject(@"LOCATION_ERROR", errorMessage, error);
            self.locationReject = nil;
            self.locationResolve = nil;
        }
        RCTLogError(@"定位失败: %@", errorMessage);
    } else if (location) {
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        
        // 基本位置信息
        result[@"latitude"] = @(location.location.coordinate.latitude);
        result[@"longitude"] = @(location.location.coordinate.longitude);
        result[@"accuracy"] = @(location.location.horizontalAccuracy);
        result[@"altitude"] = @(location.location.altitude);
        result[@"speed"] = @(location.location.speed);
        result[@"heading"] = @(location.location.course);
        result[@"timestamp"] = @([location.location.timestamp timeIntervalSince1970] * 1000);
        
        // 网络状态
        result[@"networkState"] = @(state);
        
        // 逆地理编码信息
        if (location.rgcData) {
            NSMutableDictionary *addressInfo = [NSMutableDictionary dictionary];
            addressInfo[@"formattedAddress"] = location.rgcData.formattedAddress ?: @"";
            addressInfo[@"country"] = location.rgcData.country ?: @"";
            addressInfo[@"province"] = location.rgcData.province ?: @"";
            addressInfo[@"city"] = location.rgcData.city ?: @"";
            addressInfo[@"district"] = location.rgcData.district ?: @"";
            addressInfo[@"street"] = location.rgcData.street ?: @"";
            addressInfo[@"streetNumber"] = location.rgcData.streetNumber ?: @"";
            addressInfo[@"adCode"] = location.rgcData.adCode ?: @"";
            addressInfo[@"cityCode"] = location.rgcData.cityCode ?: @"";
            result[@"address"] = addressInfo;
        }
        
        if (self.locationResolve) {
            self.locationResolve(result);
            self.locationResolve = nil;
            self.locationReject = nil;
        }
        
        RCTLogInfo(@"定位成功: %f, %f", location.location.coordinate.latitude, location.location.coordinate.longitude);
    } else {
        if (self.locationReject) {
            self.locationReject(@"LOCATION_ERROR", @"无法获取位置信息", nil);
            self.locationReject = nil;
            self.locationResolve = nil;
        }
    }
}

- (NSString *)getLocationErrorMessage:(NSError *)error {
    switch (error.code) {
        case kCLErrorLocationUnknown:
            return @"位置服务无法获取位置信息";
        case kCLErrorDenied:
            return @"位置服务被拒绝";
        case kCLErrorNetwork:
            return @"网络错误";
        case kCLErrorRegionMonitoringDenied:
            return @"区域监控被拒绝";
        case kCLErrorRegionMonitoringFailure:
            return @"区域监控失败";
        case kCLErrorRegionMonitoringSetupDelayed:
            return @"区域监控设置延迟";
        case kCLErrorRegionMonitoringResponseDelayed:
            return @"区域监控响应延迟";
        case kCLErrorGeocodeFoundNoResult:
            return @"地理编码未找到结果";
        case kCLErrorGeocodeFoundPartialResult:
            return @"地理编码找到部分结果";
        case kCLErrorGeocodeCanceled:
            return @"地理编码被取消";
        default:
            return error.localizedDescription ?: @"未知定位错误";
    }
}

RCT_EXPORT_METHOD(startLocationUpdates:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!self.isSDKInitialized) {
        reject(@"SDK_NOT_INITIALIZED", @"SDK未初始化", nil);
        return;
    }
    
    if (!self.locationManager) {
        reject(@"LOCATION_MANAGER_ERROR", @"定位管理器未初始化", nil);
        return;
    }
    
    [self.locationManager startUpdatingLocation];
    resolve(@{@"success": @YES, @"message": @"开始连续定位"});
    RCTLogInfo(@"开始连续定位");
}

RCT_EXPORT_METHOD(stopLocationUpdates:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!self.locationManager) {
        reject(@"LOCATION_MANAGER_ERROR", @"定位管理器未初始化", nil);
        return;
    }
    
    [self.locationManager stopUpdatingLocation];
    resolve(@{@"success": @YES, @"message": @"停止连续定位"});
    RCTLogInfo(@"停止连续定位");
}

RCT_EXPORT_METHOD(setLocationConfig:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!self.locationManager) {
        reject(@"LOCATION_MANAGER_ERROR", @"定位管理器未初始化", nil);
        return;
    }
    
    // 设置定位精度
    if (config[@"desiredAccuracy"]) {
        NSNumber *accuracy = config[@"desiredAccuracy"];
        self.locationManager.desiredAccuracy = [accuracy doubleValue];
    }
    
    // 设置距离过滤器
    if (config[@"distanceFilter"]) {
        NSNumber *filter = config[@"distanceFilter"];
        self.locationManager.distanceFilter = [filter doubleValue];
    }
    
    // 设置定位超时
    if (config[@"locationTimeout"]) {
        NSNumber *timeout = config[@"locationTimeout"];
        self.locationManager.locationTimeout = [timeout intValue];
    }
    
    // 设置逆地理编码超时
    if (config[@"reGeocodeTimeout"]) {
        NSNumber *timeout = config[@"reGeocodeTimeout"];
        self.locationManager.reGeocodeTimeout = [timeout intValue];
    }
    
    resolve(@{@"success": @YES, @"message": @"定位配置更新成功"});
}

#pragma mark - BMKGeneralDelegate

- (void)onGetNetworkState:(int)iError {
    RCTLogInfo(@"网络状态变化: %d", iError);
    // 可以发送事件到React Native
}

- (void)onGetPermissionState:(int)iError {
    RCTLogInfo(@"权限状态变化: %d", iError);
    // 可以发送事件到React Native
}

#pragma mark - BMKLocationManagerDelegate

- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateLocation:(BMKLocation *)location orError:(NSError *)error {
    if (error) {
        RCTLogError(@"连续定位失败: %@", error.localizedDescription);
        // 发送错误事件到React Native
    } else {
        RCTLogInfo(@"连续定位成功: %f, %f", location.location.coordinate.latitude, location.location.coordinate.longitude);
        // 发送位置更新事件到React Native
    }
}

- (void)BMKLocationManager:(BMKLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    NSString *statusString = @"";
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
            statusString = @"未确定";
            break;
        case kCLAuthorizationStatusRestricted:
            statusString = @"受限制";
            break;
        case kCLAuthorizationStatusDenied:
            statusString = @"被拒绝";
            break;
        case kCLAuthorizationStatusAuthorizedAlways:
            statusString = @"始终授权";
            break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            statusString = @"使用时授权";
            break;
        default:
            statusString = @"未知状态";
            break;
    }
    
    RCTLogInfo(@"定位权限状态变化: %@", statusString);
    // 发送权限状态变化事件到React Native
}

- (void)dealloc {
    if (self.locationManager) {
        [self.locationManager stopUpdatingLocation];
        self.locationManager.delegate = nil;
        self.locationManager = nil;
    }
    
    if (self.mapManager) {
        [self.mapManager stop];
        self.mapManager.delegate = nil;
        self.mapManager = nil;
    }
}

@end