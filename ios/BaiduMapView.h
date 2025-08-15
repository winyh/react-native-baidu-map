#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>
#import <BaiduMapAPI_Map/BMKMapComponent.h>

@interface BaiduMapView : UIView

// React Native 事件回调
@property (nonatomic, copy) RCTBubblingEventBlock onMapReady;
@property (nonatomic, copy) RCTBubblingEventBlock onPress;
@property (nonatomic, copy) RCTBubblingEventBlock onLongPress;
@property (nonatomic, copy) RCTBubblingEventBlock onRegionWillChange;
@property (nonatomic, copy) RCTBubblingEventBlock onRegionDidChange;
@property (nonatomic, copy) RCTBubblingEventBlock onUserLocationUpdate;
@property (nonatomic, copy) RCTBubblingEventBlock onUserLocationError;

// 地图管理方法
- (void)animateToRegion:(NSDictionary *)region duration:(NSTimeInterval)duration;
- (void)takeSnapshot:(void (^)(UIImage *image))completion;

// 标注管理方法
- (void)addAnnotation:(BMKPointAnnotation *)annotation;
- (void)removeAnnotation:(BMKPointAnnotation *)annotation;
- (void)removeAllAnnotations;

// 覆盖物管理方法
- (void)addOverlay:(id<BMKOverlay>)overlay;
- (void)removeOverlay:(id<BMKOverlay>)overlay;
- (void)removeAllOverlays;

// 工具方法
- (BMKCoordinateRegion)regionFromCoordinates:(NSArray *)coordinates;
- (BOOL)isValidCoordinate:(CLLocationCoordinate2D)coordinate;

@end