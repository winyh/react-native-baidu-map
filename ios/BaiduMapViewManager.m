#import "BaiduMapViewManager.h"
#import "BaiduMapView.h"
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>

@implementation BaiduMapViewManager

RCT_EXPORT_MODULE(BaiduMapView)

- (UIView *)view {
    BaiduMapView *mapView = [[BaiduMapView alloc] init];
    RCTLogInfo(@"创建百度地图视图");
    return mapView;
}

#pragma mark - React Native Properties

// 地图中心点
RCT_EXPORT_VIEW_PROPERTY(center, NSDictionary)

// 缩放级别
RCT_EXPORT_VIEW_PROPERTY(zoom, NSNumber)

// 地图类型
RCT_EXPORT_VIEW_PROPERTY(mapType, NSString)

// 显示用户位置
RCT_EXPORT_VIEW_PROPERTY(showsUserLocation, BOOL)

// 用户位置精度圆圈
RCT_EXPORT_VIEW_PROPERTY(userLocationAccuracyCircleEnabled, BOOL)

// 缩放控件
RCT_EXPORT_VIEW_PROPERTY(zoomControlsEnabled, BOOL)

// 指南针
RCT_EXPORT_VIEW_PROPERTY(compassEnabled, BOOL)

// 比例尺
RCT_EXPORT_VIEW_PROPERTY(scaleControlEnabled, BOOL)

// 手势控制
RCT_EXPORT_VIEW_PROPERTY(rotateGesturesEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(scrollGesturesEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(zoomGesturesEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(overlookGesturesEnabled, BOOL)

// 图层控制
RCT_EXPORT_VIEW_PROPERTY(trafficEnabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(buildingsEnabled, BOOL)

// 缩放级别限制
RCT_EXPORT_VIEW_PROPERTY(minZoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(maxZoomLevel, NSNumber)

// 显示区域
RCT_EXPORT_VIEW_PROPERTY(region, NSDictionary)

#pragma mark - React Native Events

// 地图事件
RCT_EXPORT_VIEW_PROPERTY(onMapReady, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onLongPress, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRegionWillChange, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRegionDidChange, RCTBubblingEventBlock)

// 用户位置事件
RCT_EXPORT_VIEW_PROPERTY(onUserLocationUpdate, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUserLocationError, RCTBubblingEventBlock)

#pragma mark - React Native Methods

// 动画到指定区域
RCT_EXPORT_METHOD(animateToRegion:(nonnull NSNumber *)reactTag
                  region:(NSDictionary *)region
                  duration:(NSTimeInterval)duration) {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        BaiduMapView *mapView = (BaiduMapView *)viewRegistry[reactTag];
        if ([mapView isKindOfClass:[BaiduMapView class]]) {
            [mapView animateToRegion:region duration:duration];
        } else {
            RCTLogError(@"无效的地图视图引用");
        }
    }];
}

// 截图
RCT_EXPORT_METHOD(takeSnapshot:(nonnull NSNumber *)reactTag
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        BaiduMapView *mapView = (BaiduMapView *)viewRegistry[reactTag];
        if ([mapView isKindOfClass:[BaiduMapView class]]) {
            [mapView takeSnapshot:^(UIImage *image) {
                if (image) {
                    NSData *imageData = UIImagePNGRepresentation(image);
                    NSString *base64String = [imageData base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];
                    resolve(@{
                        @"uri": [NSString stringWithFormat:@"data:image/png;base64,%@", base64String],
                        @"width": @(image.size.width),
                        @"height": @(image.size.height)
                    });
                } else {
                    reject(@"SNAPSHOT_FAILED", @"截图失败", nil);
                }
            }];
        } else {
            reject(@"INVALID_VIEW", @"无效的地图视图引用", nil);
        }
    }];
}

// 添加标注
RCT_EXPORT_METHOD(addAnnotation:(nonnull NSNumber *)reactTag
                  annotation:(NSDictionary *)annotationData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        BaiduMapView *mapView = (BaiduMapView *)viewRegistry[reactTag];
        if ([mapView isKindOfClass:[BaiduMapView class]]) {
            @try {
                // 创建标注
                BMKPointAnnotation *annotation = [[BMKPointAnnotation alloc] init];
                
                // 设置坐标
                double latitude = [annotationData[@"coordinate"][@"latitude"] doubleValue];
                double longitude = [annotationData[@"coordinate"][@"longitude"] doubleValue];
                annotation.coordinate = CLLocationCoordinate2DMake(latitude, longitude);
                
                // 设置标题和副标题
                if (annotationData[@"title"]) {
                    annotation.title = annotationData[@"title"];
                }
                if (annotationData[@"subtitle"]) {
                    annotation.subtitle = annotationData[@"subtitle"];
                }
                
                [mapView addAnnotation:annotation];
                
                resolve(@{
                    @"success": @YES,
                    @"message": @"标注添加成功"
                });
                
            } @catch (NSException *exception) {
                reject(@"ADD_ANNOTATION_FAILED", exception.reason, nil);
            }
        } else {
            reject(@"INVALID_VIEW", @"无效的地图视图引用", nil);
        }
    }];
}

// 移除所有标注
RCT_EXPORT_METHOD(removeAllAnnotations:(nonnull NSNumber *)reactTag
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        BaiduMapView *mapView = (BaiduMapView *)viewRegistry[reactTag];
        if ([mapView isKindOfClass:[BaiduMapView class]]) {
            [mapView removeAllAnnotations];
            resolve(@{
                @"success": @YES,
                @"message": @"所有标注已移除"
            });
        } else {
            reject(@"INVALID_VIEW", @"无效的地图视图引用", nil);
        }
    }];
}

// 添加覆盖物
RCT_EXPORT_METHOD(addOverlay:(nonnull NSNumber *)reactTag
                  overlayData:(NSDictionary *)overlayData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        BaiduMapView *mapView = (BaiduMapView *)viewRegistry[reactTag];
        if ([mapView isKindOfClass:[BaiduMapView class]]) {
            @try {
                NSString *type = overlayData[@"type"];
                
                if ([type isEqualToString:@"polyline"]) {
                    // 创建折线
                    NSArray *coordinates = overlayData[@"coordinates"];
                    CLLocationCoordinate2D *coords = malloc(sizeof(CLLocationCoordinate2D) * coordinates.count);
                    
                    for (NSInteger i = 0; i < coordinates.count; i++) {
                        NSDictionary *coord = coordinates[i];
                        coords[i] = CLLocationCoordinate2DMake(
                            [coord[@"latitude"] doubleValue],
                            [coord[@"longitude"] doubleValue]
                        );
                    }
                    
                    BMKPolyline *polyline = [BMKPolyline polylineWithCoordinates:coords count:coordinates.count];
                    [mapView addOverlay:polyline];
                    
                    free(coords);
                    
                } else if ([type isEqualToString:@"polygon"]) {
                    // 创建多边形
                    NSArray *coordinates = overlayData[@"coordinates"];
                    CLLocationCoordinate2D *coords = malloc(sizeof(CLLocationCoordinate2D) * coordinates.count);
                    
                    for (NSInteger i = 0; i < coordinates.count; i++) {
                        NSDictionary *coord = coordinates[i];
                        coords[i] = CLLocationCoordinate2DMake(
                            [coord[@"latitude"] doubleValue],
                            [coord[@"longitude"] doubleValue]
                        );
                    }
                    
                    BMKPolygon *polygon = [BMKPolygon polygonWithCoordinates:coords count:coordinates.count];
                    [mapView addOverlay:polygon];
                    
                    free(coords);
                    
                } else if ([type isEqualToString:@"circle"]) {
                    // 创建圆形
                    NSDictionary *center = overlayData[@"center"];
                    double radius = [overlayData[@"radius"] doubleValue];
                    
                    CLLocationCoordinate2D centerCoord = CLLocationCoordinate2DMake(
                        [center[@"latitude"] doubleValue],
                        [center[@"longitude"] doubleValue]
                    );
                    
                    BMKCircle *circle = [BMKCircle circleWithCenterCoordinate:centerCoord radius:radius];
                    [mapView addOverlay:circle];
                }
                
                resolve(@{
                    @"success": @YES,
                    @"message": @"覆盖物添加成功"
                });
                
            } @catch (NSException *exception) {
                reject(@"ADD_OVERLAY_FAILED", exception.reason, nil);
            }
        } else {
            reject(@"INVALID_VIEW", @"无效的地图视图引用", nil);
        }
    }];
}

// 移除所有覆盖物
RCT_EXPORT_METHOD(removeAllOverlays:(nonnull NSNumber *)reactTag
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        BaiduMapView *mapView = (BaiduMapView *)viewRegistry[reactTag];
        if ([mapView isKindOfClass:[BaiduMapView class]]) {
            [mapView removeAllOverlays];
            resolve(@{
                @"success": @YES,
                @"message": @"所有覆盖物已移除"
            });
        } else {
            reject(@"INVALID_VIEW", @"无效的地图视图引用", nil);
        }
    }];
}

// 获取地图状态
RCT_EXPORT_METHOD(getMapStatus:(nonnull NSNumber *)reactTag
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        BaiduMapView *mapView = (BaiduMapView *)viewRegistry[reactTag];
        if ([mapView isKindOfClass:[BaiduMapView class]]) {
            // 获取地图当前状态
            // 注意：需要在BaiduMapView中实现相应的getter方法
            resolve(@{
                @"center": @{
                    @"latitude": @(39.915), // 临时值，实际应从mapView获取
                    @"longitude": @(116.404)
                },
                @"zoom": @(12.0),
                @"rotation": @(0.0),
                @"overlook": @(0.0)
            });
        } else {
            reject(@"INVALID_VIEW", @"无效的地图视图引用", nil);
        }
    }];
}

#pragma mark - Utility Methods

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

@end