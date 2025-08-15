#import "BaiduMapView.h"
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <BaiduMapAPI_Base/BMKBaseComponent.h>
#import <BaiduMapAPI_Map/BMKMapComponent.h>

@interface BaiduMapView () <BMKMapViewDelegate>

@property (nonatomic, strong) BMKMapView *mapView;
@property (nonatomic, assign) BOOL isMapLoaded;
@property (nonatomic, strong) NSMutableArray *annotations;
@property (nonatomic, strong) NSMutableArray *overlays;

// 地图配置属性
@property (nonatomic, assign) CLLocationCoordinate2D centerCoordinate;
@property (nonatomic, assign) float zoomLevel;
@property (nonatomic, assign) BMKMapType mapType;
@property (nonatomic, assign) BOOL showsUserLocation;
@property (nonatomic, assign) BOOL zoomEnabled;
@property (nonatomic, assign) BOOL scrollEnabled;
@property (nonatomic, assign) BOOL rotateEnabled;
@property (nonatomic, assign) BOOL overlookEnabled;
@property (nonatomic, assign) BOOL showsCompass;
@property (nonatomic, assign) BOOL showsScale;

@end

@implementation BaiduMapView

- (instancetype)init {
    self = [super init];
    if (self) {
        [self initializeMapView];
        [self setupDefaultProperties];
    }
    return self;
}

- (void)initializeMapView {
    // 创建百度地图视图
    self.mapView = [[BMKMapView alloc] init];
    self.mapView.delegate = self;
    
    // 设置地图的基本属性
    self.mapView.mapType = BMKMapTypeStandard;
    self.mapView.zoomLevel = 12;
    self.mapView.showsUserLocation = NO;
    self.mapView.userTrackingMode = BMKUserTrackingModeNone;
    
    // 启用手势
    self.mapView.zoomEnabled = YES;
    self.mapView.scrollEnabled = YES;
    self.mapView.rotateEnabled = YES;
    self.mapView.overlookEnabled = YES;
    
    // 显示控件
    self.mapView.showMapScaleBar = YES;
    self.mapView.mapScaleBarPosition = CGPointMake(10, 100);
    self.mapView.showIndoorMapPoi = NO;
    
    [self addSubview:self.mapView];
    
    // 初始化数组
    self.annotations = [[NSMutableArray alloc] init];
    self.overlays = [[NSMutableArray alloc] init];
    self.isMapLoaded = NO;
    
    RCTLogInfo(@"百度地图视图初始化完成");
}

- (void)setupDefaultProperties {
    // 设置默认属性
    self.centerCoordinate = CLLocationCoordinate2DMake(39.915, 116.404); // 北京天安门
    self.zoomLevel = 12.0f;
    self.mapType = BMKMapTypeStandard;
    self.showsUserLocation = NO;
    self.zoomEnabled = YES;
    self.scrollEnabled = YES;
    self.rotateEnabled = YES;
    self.overlookEnabled = YES;
    self.showsCompass = YES;
    self.showsScale = YES;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    self.mapView.frame = self.bounds;
}

- (void)dealloc {
    if (self.mapView) {
        self.mapView.delegate = nil;
        [self.mapView removeFromSuperview];
        self.mapView = nil;
    }
    RCTLogInfo(@"百度地图视图已销毁");
}

#pragma mark - React Native Properties

- (void)setCenter:(NSDictionary *)center {
    if (center && center[@"latitude"] && center[@"longitude"]) {
        double latitude = [center[@"latitude"] doubleValue];
        double longitude = [center[@"longitude"] doubleValue];
        
        CLLocationCoordinate2D coordinate = CLLocationCoordinate2DMake(latitude, longitude);
        if (CLLocationCoordinate2DIsValid(coordinate)) {
            self.centerCoordinate = coordinate;
            
            if (self.mapView) {
                [self.mapView setCenterCoordinate:coordinate animated:YES];
                RCTLogInfo(@"地图中心点已设置: %f, %f", latitude, longitude);
            }
        } else {
            RCTLogError(@"无效的坐标: %f, %f", latitude, longitude);
        }
    }
}

- (void)setZoom:(NSNumber *)zoom {
    if (zoom) {
        float zoomLevel = [zoom floatValue];
        if (zoomLevel >= 3.0f && zoomLevel <= 21.0f) {
            self.zoomLevel = zoomLevel;
            
            if (self.mapView) {
                [self.mapView setZoomLevel:zoomLevel];
                RCTLogInfo(@"地图缩放级别已设置: %f", zoomLevel);
            }
        } else {
            RCTLogError(@"无效的缩放级别: %f，有效范围: 3.0-21.0", zoomLevel);
        }
    }
}

- (void)setMapType:(NSString *)mapType {
    BMKMapType type = BMKMapTypeStandard;
    
    if ([mapType isEqualToString:@"standard"]) {
        type = BMKMapTypeStandard;
    } else if ([mapType isEqualToString:@"satellite"]) {
        type = BMKMapTypeSatellite;
    } else if ([mapType isEqualToString:@"none"]) {
        type = BMKMapTypeNone;
    }
    
    self.mapType = type;
    
    if (self.mapView) {
        self.mapView.mapType = type;
        RCTLogInfo(@"地图类型已设置: %@", mapType);
    }
}

- (void)setShowsUserLocation:(BOOL)showsUserLocation {
    self.showsUserLocation = showsUserLocation;
    
    if (self.mapView) {
        self.mapView.showsUserLocation = showsUserLocation;
        RCTLogInfo(@"用户位置显示已设置: %@", showsUserLocation ? @"开启" : @"关闭");
    }
}

- (void)setZoomEnabled:(BOOL)zoomEnabled {
    self.zoomEnabled = zoomEnabled;
    
    if (self.mapView) {
        self.mapView.zoomEnabled = zoomEnabled;
        RCTLogInfo(@"缩放手势已设置: %@", zoomEnabled ? @"启用" : @"禁用");
    }
}

- (void)setScrollEnabled:(BOOL)scrollEnabled {
    self.scrollEnabled = scrollEnabled;
    
    if (self.mapView) {
        self.mapView.scrollEnabled = scrollEnabled;
        RCTLogInfo(@"滚动手势已设置: %@", scrollEnabled ? @"启用" : @"禁用");
    }
}

- (void)setRotateEnabled:(BOOL)rotateEnabled {
    self.rotateEnabled = rotateEnabled;
    
    if (self.mapView) {
        self.mapView.rotateEnabled = rotateEnabled;
        RCTLogInfo(@"旋转手势已设置: %@", rotateEnabled ? @"启用" : @"禁用");
    }
}

- (void)setOverlookEnabled:(BOOL)overlookEnabled {
    self.overlookEnabled = overlookEnabled;
    
    if (self.mapView) {
        self.mapView.overlookEnabled = overlookEnabled;
        RCTLogInfo(@"俯视手势已设置: %@", overlookEnabled ? @"启用" : @"禁用");
    }
}

- (void)setShowsCompass:(BOOL)showsCompass {
    self.showsCompass = showsCompass;
    
    if (self.mapView) {
        // 百度地图iOS SDK中指南针的显示控制
        // 注意：具体实现可能需要根据SDK版本调整
        RCTLogInfo(@"指南针显示已设置: %@", showsCompass ? @"显示" : @"隐藏");
    }
}

- (void)setShowsScale:(BOOL)showsScale {
    self.showsScale = showsScale;
    
    if (self.mapView) {
        self.mapView.showMapScaleBar = showsScale;
        RCTLogInfo(@"比例尺显示已设置: %@", showsScale ? @"显示" : @"隐藏");
    }
}

#pragma mark - Public Methods

- (void)animateToRegion:(NSDictionary *)region duration:(NSTimeInterval)duration {
    if (!region) return;
    
    double latitude = [region[@"latitude"] doubleValue];
    double longitude = [region[@"longitude"] doubleValue];
    double latitudeDelta = [region[@"latitudeDelta"] doubleValue];
    double longitudeDelta = [region[@"longitudeDelta"] doubleValue];
    
    CLLocationCoordinate2D center = CLLocationCoordinate2DMake(latitude, longitude);
    
    if (CLLocationCoordinate2DIsValid(center)) {
        BMKCoordinateSpan span = BMKCoordinateSpanMake(latitudeDelta, longitudeDelta);
        BMKCoordinateRegion coordinateRegion = BMKCoordinateRegionMake(center, span);
        
        [self.mapView setRegion:coordinateRegion animated:YES];
        RCTLogInfo(@"地图区域动画已开始");
    }
}

- (void)takeSnapshot:(void (^)(UIImage *image))completion {
    if (!self.mapView) {
        completion(nil);
        return;
    }
    
    [self.mapView takeSnapshot:^(UIImage *image) {
        completion(image);
    }];
}

#pragma mark - BMKMapViewDelegate

- (void)mapViewDidFinishLoading:(BMKMapView *)mapView {
    self.isMapLoaded = YES;
    RCTLogInfo(@"地图加载完成");
    
    if (self.onMapReady) {
        self.onMapReady(@{
            @"success": @YES,
            @"message": @"地图加载完成"
        });
    }
}

- (void)mapView:(BMKMapView *)mapView didFailToLoadWithError:(NSError *)error {
    RCTLogError(@"地图加载失败: %@", error.localizedDescription);
    
    if (self.onMapReady) {
        self.onMapReady(@{
            @"success": @NO,
            @"error": error.localizedDescription
        });
    }
}

- (void)mapView:(BMKMapView *)mapView onClickedMapBlank:(CLLocationCoordinate2D)coordinate {
    if (self.onPress) {
        self.onPress(@{
            @"coordinate": @{
                @"latitude": @(coordinate.latitude),
                @"longitude": @(coordinate.longitude)
            },
            @"position": @{
                @"x": @0,
                @"y": @0
            }
        });
    }
}

- (void)mapView:(BMKMapView *)mapView onLongClick:(CLLocationCoordinate2D)coordinate {
    if (self.onLongPress) {
        self.onLongPress(@{
            @"coordinate": @{
                @"latitude": @(coordinate.latitude),
                @"longitude": @(coordinate.longitude)
            },
            @"position": @{
                @"x": @0,
                @"y": @0
            }
        });
    }
}

- (void)mapView:(BMKMapView *)mapView regionWillChangeAnimated:(BOOL)animated {
    if (self.onRegionWillChange) {
        BMKCoordinateRegion region = mapView.region;
        self.onRegionWillChange(@{
            @"region": @{
                @"latitude": @(region.center.latitude),
                @"longitude": @(region.center.longitude),
                @"latitudeDelta": @(region.span.latitudeDelta),
                @"longitudeDelta": @(region.span.longitudeDelta)
            },
            @"animated": @(animated)
        });
    }
}

- (void)mapView:(BMKMapView *)mapView regionDidChangeAnimated:(BOOL)animated {
    if (self.onRegionDidChange) {
        BMKCoordinateRegion region = mapView.region;
        self.onRegionDidChange(@{
            @"region": @{
                @"latitude": @(region.center.latitude),
                @"longitude": @(region.center.longitude),
                @"latitudeDelta": @(region.span.latitudeDelta),
                @"longitudeDelta": @(region.span.longitudeDelta)
            },
            @"animated": @(animated),
            @"zoomLevel": @(mapView.zoomLevel)
        });
    }
}

- (void)mapViewDidFinishRender:(BMKMapView *)mapView {
    // 地图渲染完成
    RCTLogInfo(@"地图渲染完成");
}

- (void)mapView:(BMKMapView *)mapView didUpdateUserLocation:(BMKUserLocation *)userLocation {
    if (self.onUserLocationUpdate) {
        CLLocation *location = userLocation.location;
        self.onUserLocationUpdate(@{
            @"coordinate": @{
                @"latitude": @(location.coordinate.latitude),
                @"longitude": @(location.coordinate.longitude)
            },
            @"accuracy": @(location.horizontalAccuracy),
            @"altitude": @(location.altitude),
            @"speed": @(location.speed),
            @"heading": @(location.course),
            @"timestamp": @([location.timestamp timeIntervalSince1970] * 1000)
        });
    }
}

- (void)mapView:(BMKMapView *)mapView didFailToLocateUserWithError:(NSError *)error {
    RCTLogError(@"用户定位失败: %@", error.localizedDescription);
    
    if (self.onUserLocationError) {
        self.onUserLocationError(@{
            @"error": error.localizedDescription,
            @"code": @(error.code)
        });
    }
}

#pragma mark - Annotation Management

- (void)addAnnotation:(BMKPointAnnotation *)annotation {
    if (annotation && self.mapView) {
        [self.annotations addObject:annotation];
        [self.mapView addAnnotation:annotation];
        RCTLogInfo(@"添加标注: %f, %f", annotation.coordinate.latitude, annotation.coordinate.longitude);
    }
}

- (void)removeAnnotation:(BMKPointAnnotation *)annotation {
    if (annotation && self.mapView) {
        [self.annotations removeObject:annotation];
        [self.mapView removeAnnotation:annotation];
        RCTLogInfo(@"移除标注: %f, %f", annotation.coordinate.latitude, annotation.coordinate.longitude);
    }
}

- (void)removeAllAnnotations {
    if (self.mapView && self.annotations.count > 0) {
        [self.mapView removeAnnotations:self.annotations];
        [self.annotations removeAllObjects];
        RCTLogInfo(@"移除所有标注");
    }
}

#pragma mark - Overlay Management

- (void)addOverlay:(id<BMKOverlay>)overlay {
    if (overlay && self.mapView) {
        [self.overlays addObject:overlay];
        [self.mapView addOverlay:overlay];
        RCTLogInfo(@"添加覆盖物");
    }
}

- (void)removeOverlay:(id<BMKOverlay>)overlay {
    if (overlay && self.mapView) {
        [self.overlays removeObject:overlay];
        [self.mapView removeOverlay:overlay];
        RCTLogInfo(@"移除覆盖物");
    }
}

- (void)removeAllOverlays {
    if (self.mapView && self.overlays.count > 0) {
        [self.mapView removeOverlays:self.overlays];
        [self.overlays removeAllObjects];
        RCTLogInfo(@"移除所有覆盖物");
    }
}

#pragma mark - Utility Methods

- (BMKCoordinateRegion)regionFromCoordinates:(NSArray *)coordinates {
    if (coordinates.count == 0) {
        return BMKCoordinateRegionMake(self.centerCoordinate, BMKCoordinateSpanMake(0.01, 0.01));
    }
    
    double minLat = 90.0, maxLat = -90.0;
    double minLng = 180.0, maxLng = -180.0;
    
    for (NSDictionary *coord in coordinates) {
        double lat = [coord[@"latitude"] doubleValue];
        double lng = [coord[@"longitude"] doubleValue];
        
        minLat = MIN(minLat, lat);
        maxLat = MAX(maxLat, lat);
        minLng = MIN(minLng, lng);
        maxLng = MAX(maxLng, lng);
    }
    
    CLLocationCoordinate2D center = CLLocationCoordinate2DMake((minLat + maxLat) / 2, (minLng + maxLng) / 2);
    BMKCoordinateSpan span = BMKCoordinateSpanMake(maxLat - minLat, maxLng - minLng);
    
    return BMKCoordinateRegionMake(center, span);
}

- (BOOL)isValidCoordinate:(CLLocationCoordinate2D)coordinate {
    return CLLocationCoordinate2DIsValid(coordinate) &&
           coordinate.latitude >= -90.0 && coordinate.latitude <= 90.0 &&
           coordinate.longitude >= -180.0 && coordinate.longitude <= 180.0;
}

@end