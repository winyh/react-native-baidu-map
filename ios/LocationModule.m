//
//  LocationModule.m
//  BaiduMap
//
//  Created by winyh on 2024/01/01.
//  Copyright © 2024 winyh. All rights reserved.
//

#import "LocationModule.h"
#import <React/RCTLog.h>
#import <CoreLocation/CoreLocation.h>

// 注意：需要导入百度定位iOS SDK
// #import <BaiduMapAPI_Location/BMKLocationComponent.h>

@interface LocationModule () <CLLocationManagerDelegate>

@property (nonatomic, strong) CLLocationManager *locationManager;
@property (nonatomic, assign) BOOL isLocationUpdating;
@property (nonatomic, copy) RCTPromiseResolveBlock locationResolve;
@property (nonatomic, copy) RCTPromiseRejectBlock locationReject;

@end

@implementation LocationModule

RCT_EXPORT_MODULE(LocationModule)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"onLocationUpdate", @"onLocationError"];
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        _locationManager.distanceFilter = 10.0;
        _isLocationUpdating = NO;
    }
    return self;
}

#pragma mark - 定位方法

RCT_EXPORT_METHOD(getCurrentLocation:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // 检查定位权限
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        reject(@"LOCATION_PERMISSION_DENIED", @"定位权限被拒绝", nil);
        return;
    }
    
    if (status == kCLAuthorizationStatusNotDetermined) {
        [self.locationManager requestWhenInUseAuthorization];
        reject(@"LOCATION_PERMISSION_NOT_DETERMINED", @"定位权限未确定，请授权后重试", nil);
        return;
    }
    
    // 保存回调
    self.locationResolve = resolve;
    self.locationReject = reject;
    
    // TODO: 使用百度定位SDK获取位置
    // 当集成百度定位iOS SDK后，取消注释以下代码：
    /*
    BMKLocationManager *locationManager = [[BMKLocationManager alloc] init];
    [locationManager requestLocationWithReGeocode:YES withNetworkState:YES completionBlock:^(BMKLocation * _Nullable location, BMKLocationNetworkState state, NSError * _Nullable error) {
        if (error) {
            if (self.locationReject) {
                self.locationReject(@"LOCATION_ERROR", error.localizedDescription, error);
                self.locationReject = nil;
                self.locationResolve = nil;
            }
            return;
        }
        
        NSDictionary *result = @{
            @"latitude": @(location.location.coordinate.latitude),
            @"longitude": @(location.location.coordinate.longitude),
            @"accuracy": @(location.location.horizontalAccuracy),
            @"altitude": @(location.location.altitude),
            @"speed": @(location.location.speed),
            @"course": @(location.location.course),
            @"timestamp": @([location.location.timestamp timeIntervalSince1970] * 1000),
            @"address": location.rgcData.address ?: @"",
            @"province": location.rgcData.province ?: @"",
            @"city": location.rgcData.city ?: @"",
            @"district": location.rgcData.district ?: @"",
            @"street": location.rgcData.street ?: @""
        };
        
        if (self.locationResolve) {
            self.locationResolve(result);
            self.locationResolve = nil;
            self.locationReject = nil;
        }
    }];
    */
    
    // 使用系统定位服务获取位置（模拟）
    [self.locationManager requestLocation];
}

RCT_EXPORT_METHOD(startLocationUpdates:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.isLocationUpdating) {
        resolve(@{@"success": @YES, @"message": @"定位更新已在进行中"});
        return;
    }
    
    // 检查定位权限
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        reject(@"LOCATION_PERMISSION_DENIED", @"定位权限被拒绝", nil);
        return;
    }
    
    if (status == kCLAuthorizationStatusNotDetermined) {
        [self.locationManager requestWhenInUseAuthorization];
        reject(@"LOCATION_PERMISSION_NOT_DETERMINED", @"定位权限未确定，请授权后重试", nil);
        return;
    }
    
    // 配置定位参数
    if (options[@"accuracy"]) {
        NSString *accuracy = options[@"accuracy"];
        if ([accuracy isEqualToString:@"high"]) {
            self.locationManager.desiredAccuracy = kCLLocationAccuracyBest;
        } else if ([accuracy isEqualToString:@"medium"]) {
            self.locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
        } else {
            self.locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters;
        }
    }
    
    if (options[@"distanceFilter"]) {
        self.locationManager.distanceFilter = [options[@"distanceFilter"] doubleValue];
    }
    
    // TODO: 使用百度定位SDK开始连续定位
    // 当集成百度定位iOS SDK后，实现连续定位功能
    
    // 使用系统定位服务开始连续定位
    [self.locationManager startUpdatingLocation];
    self.isLocationUpdating = YES;
    
    resolve(@{@"success": @YES, @"message": @"开始连续定位"});
}

RCT_EXPORT_METHOD(stopLocationUpdates:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!self.isLocationUpdating) {
        resolve(@{@"success": @YES, @"message": @"定位更新未在进行中"});
        return;
    }
    
    // TODO: 停止百度定位SDK连续定位
    // 当集成百度定位iOS SDK后，实现停止定位功能
    
    // 停止系统定位服务
    [self.locationManager stopUpdatingLocation];
    self.isLocationUpdating = NO;
    
    resolve(@{@"success": @YES, @"message": @"停止连续定位"});
}

RCT_EXPORT_METHOD(isLocationUpdating:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(@{@"updating": @(self.isLocationUpdating)});
}

#pragma mark - 权限方法

RCT_EXPORT_METHOD(requestLocationPermission:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    
    if (status == kCLAuthorizationStatusAuthorizedWhenInUse || status == kCLAuthorizationStatusAuthorizedAlways) {
        resolve(@{@"granted": @YES, @"status": @"granted"});
        return;
    }
    
    if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
        resolve(@{@"granted": @NO, @"status": @"denied"});
        return;
    }
    
    // 请求权限
    [self.locationManager requestWhenInUseAuthorization];
    
    // 由于权限请求是异步的，这里返回pending状态
    resolve(@{@"granted": @NO, @"status": @"pending"});
}

RCT_EXPORT_METHOD(checkLocationPermission:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    
    NSString *statusString;
    BOOL granted = NO;
    
    switch (status) {
        case kCLAuthorizationStatusAuthorizedWhenInUse:
        case kCLAuthorizationStatusAuthorizedAlways:
            statusString = @"granted";
            granted = YES;
            break;
        case kCLAuthorizationStatusDenied:
        case kCLAuthorizationStatusRestricted:
            statusString = @"denied";
            break;
        case kCLAuthorizationStatusNotDetermined:
            statusString = @"not_determined";
            break;
        default:
            statusString = @"unknown";
            break;
    }
    
    resolve(@{
        @"granted": @(granted),
        @"status": statusString
    });
}

#pragma mark - CLLocationManagerDelegate

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations
{
    CLLocation *location = [locations lastObject];
    if (!location) return;
    
    // 如果是单次定位请求
    if (self.locationResolve) {
        NSDictionary *result = @{
            @"latitude": @(location.coordinate.latitude),
            @"longitude": @(location.coordinate.longitude),
            @"accuracy": @(location.horizontalAccuracy),
            @"altitude": @(location.altitude),
            @"speed": @(location.speed),
            @"course": @(location.course),
            @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000),
            @"address": @"", // 系统定位不提供地址信息
            @"province": @"",
            @"city": @"",
            @"district": @"",
            @"street": @""
        };
        
        self.locationResolve(result);
        self.locationResolve = nil;
        self.locationReject = nil;
        return;
    }
    
    // 连续定位更新事件
    if (self.isLocationUpdating) {
        NSDictionary *locationData = @{
            @"latitude": @(location.coordinate.latitude),
            @"longitude": @(location.coordinate.longitude),
            @"accuracy": @(location.horizontalAccuracy),
            @"altitude": @(location.altitude),
            @"speed": @(location.speed),
            @"course": @(location.course),
            @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000),
            @"address": @"",
            @"province": @"",
            @"city": @"",
            @"district": @"",
            @"street": @""
        };
        
        [self sendEventWithName:@"onLocationUpdate" body:@{
            @"location": locationData
        }];
    }
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    RCTLogError(@"定位失败: %@", error.localizedDescription);
    
    // 如果是单次定位请求
    if (self.locationReject) {
        self.locationReject(@"LOCATION_ERROR", error.localizedDescription, error);
        self.locationResolve = nil;
        self.locationReject = nil;
        return;
    }
    
    // 连续定位错误事件
    if (self.isLocationUpdating) {
        [self sendEventWithName:@"onLocationError" body:@{
            @"code": @(error.code),
            @"message": error.localizedDescription
        }];
    }
}

- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status
{
    NSString *statusString;
    BOOL granted = NO;
    
    switch (status) {
        case kCLAuthorizationStatusAuthorizedWhenInUse:
        case kCLAuthorizationStatusAuthorizedAlways:
            statusString = @"granted";
            granted = YES;
            break;
        case kCLAuthorizationStatusDenied:
        case kCLAuthorizationStatusRestricted:
            statusString = @"denied";
            break;
        case kCLAuthorizationStatusNotDetermined:
            statusString = @"not_determined";
            break;
        default:
            statusString = @"unknown";
            break;
    }
    
    // 发送权限状态变化事件
    [self sendEventWithName:@"onLocationPermissionChange" body:@{
        @"granted": @(granted),
        @"status": statusString
    }];
    
    RCTLogInfo(@"定位权限状态变化: %@", statusString);
}

- (void)dealloc
{
    [self.locationManager stopUpdatingLocation];
    self.locationManager.delegate = nil;
}

@end