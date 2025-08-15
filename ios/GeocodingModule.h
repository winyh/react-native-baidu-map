#import <React/RCTBridgeModule.h>
#import <BaiduMapAPI_Search/BMKSearchComponent.h>

@interface GeocodingModule : NSObject <RCTBridgeModule, BMKGeoCodeSearchDelegate, BMKPoiSearchDelegate, BMKSuggestionSearchDelegate>

@end