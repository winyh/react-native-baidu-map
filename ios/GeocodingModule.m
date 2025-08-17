#import "GeocodingModule.h"
#import <React/RCTLog.h>
#import <BaiduMapAPI_Search/BMKGeoCodeSearch.h>
#import <BaiduMapAPI_Search/BMKPoiSearch.h>
#import <BaiduMapAPI_Search/BMKSuggestionSearch.h>

@interface GeocodingModule()
@property (nonatomic, strong) BMKGeoCodeSearch *geoCodeSearch;
@property (nonatomic, strong) BMKPoiSearch *poiSearch;
@property (nonatomic, strong) BMKSuggestionSearch *suggestionSearch;
@property (nonatomic, strong) NSMutableDictionary *pendingPromises;
@end

@implementation GeocodingModule

RCT_EXPORT_MODULE(BaiduGeocodingModule)

- (instancetype)init {
    self = [super init];
    if (self) {
        _geoCodeSearch = [[BMKGeoCodeSearch alloc] init];
        _geoCodeSearch.delegate = self;
        
        _poiSearch = [[BMKPoiSearch alloc] init];
        _poiSearch.delegate = self;
        
        _suggestionSearch = [[BMKSuggestionSearch alloc] init];
        _suggestionSearch.delegate = self;
        
        _pendingPromises = [NSMutableDictionary dictionary];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_METHOD(geocoding:(NSString *)address
                  city:(NSString *)city
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!address || address.length == 0) {
        reject(@"1002", @"地址不能为空", nil);
        return;
    }
    
    RCTLogInfo(@"开始地理编码: %@, 城市: %@", address, city);
    
    // 保存Promise
    NSString *requestId = [NSString stringWithFormat:@"geocoding_%@", @([[NSDate date] timeIntervalSince1970])];
    self.pendingPromises[requestId] = @{@"resolve": resolve, @"reject": reject, @"type": @"geocoding"};
    
    // 创建地理编码请求
    BMKGeoCodeSearchOption *option = [[BMKGeoCodeSearchOption alloc] init];
    option.address = address;
    if (city && city.length > 0) {
        option.city = city;
    }
    
    BOOL success = [self.geoCodeSearch geoCode:option];
    if (!success) {
        [self.pendingPromises removeObjectForKey:requestId];
        reject(@"4004", @"地理编码请求失败", nil);
    }
}

RCT_EXPORT_METHOD(reverseGeocoding:(NSDictionary *)coordinate
                  radius:(NSNumber *)radius
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!coordinate || !coordinate[@"latitude"] || !coordinate[@"longitude"]) {
        reject(@"1002", @"坐标参数无效", nil);
        return;
    }
    
    double lat = [coordinate[@"latitude"] doubleValue];
    double lng = [coordinate[@"longitude"] doubleValue];
    
    RCTLogInfo(@"开始逆地理编码: %f, %f", lat, lng);
    
    // 保存Promise
    NSString *requestId = [NSString stringWithFormat:@"reverse_geocoding_%@", @([[NSDate date] timeIntervalSince1970])];
    self.pendingPromises[requestId] = @{@"resolve": resolve, @"reject": reject, @"type": @"reverse_geocoding"};
    
    // 创建逆地理编码请求
    BMKReverseGeoCodeSearchOption *option = [[BMKReverseGeoCodeSearchOption alloc] init];
    option.location = CLLocationCoordinate2DMake(lat, lng);
    
    BOOL success = [self.geoCodeSearch reverseGeoCode:option];
    if (!success) {
        [self.pendingPromises removeObjectForKey:requestId];
        reject(@"4004", @"逆地理编码请求失败", nil);
    }
}

RCT_EXPORT_METHOD(searchPOI:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *keyword = options[@"keyword"];
    if (!keyword || keyword.length == 0) {
        reject(@"1002", @"搜索关键词不能为空", nil);
        return;
    }
    
    RCTLogInfo(@"开始POI搜索: %@", keyword);
    
    // 保存Promise
    NSString *requestId = [NSString stringWithFormat:@"poi_search_%@", @([[NSDate date] timeIntervalSince1970])];
    self.pendingPromises[requestId] = @{@"resolve": resolve, @"reject": reject, @"type": @"poi_search"};
    
    // 创建POI搜索请求
    BMKPOICitySearchOption *option = [[BMKPOICitySearchOption alloc] init];
    option.keyword = keyword;
    
    if (options[@"city"]) {
        option.city = options[@"city"];
    }
    
    if (options[@"pageIndex"]) {
        option.pageIndex = [options[@"pageIndex"] intValue];
    }
    
    if (options[@"pageSize"]) {
        option.pageSize = [options[@"pageSize"] intValue];
    }
    
    BOOL success = [self.poiSearch poiSearchInCity:option];
    if (!success) {
        [self.pendingPromises removeObjectForKey:requestId];
        reject(@"4004", @"POI搜索请求失败", nil);
    }
}

RCT_EXPORT_METHOD(searchNearby:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary *location = options[@"location"];
    if (!location || !location[@"latitude"] || !location[@"longitude"]) {
        reject(@"1002", @"搜索位置参数无效", nil);
        return;
    }
    
    NSNumber *radius = options[@"radius"];
    if (!radius || [radius intValue] <= 0) {
        reject(@"1002", @"搜索半径必须大于0", nil);
        return;
    }
    
    double lat = [location[@"latitude"] doubleValue];
    double lng = [location[@"longitude"] doubleValue];
    
    RCTLogInfo(@"开始周边搜索: %f, %f, 半径: %@", lat, lng, radius);
    
    // 保存Promise
    NSString *requestId = [NSString stringWithFormat:@"nearby_search_%@", @([[NSDate date] timeIntervalSince1970])];
    self.pendingPromises[requestId] = @{@"resolve": resolve, @"reject": reject, @"type": @"nearby_search"};
    
    // 创建周边搜索请求
    BMKPOINearbySearchOption *option = [[BMKPOINearbySearchOption alloc] init];
    option.location = CLLocationCoordinate2DMake(lat, lng);
    option.radius = [radius intValue];
    
    if (options[@"keyword"]) {
        option.keyword = options[@"keyword"];
    }
    
    if (options[@"pageIndex"]) {
        option.pageIndex = [options[@"pageIndex"] intValue];
    }
    
    if (options[@"pageSize"]) {
        option.pageSize = [options[@"pageSize"] intValue];
    }
    
    BOOL success = [self.poiSearch poiSearchNearBy:option];
    if (!success) {
        [self.pendingPromises removeObjectForKey:requestId];
        reject(@"4004", @"周边搜索请求失败", nil);
    }
}

RCT_EXPORT_METHOD(searchSuggestion:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *keyword = options[@"keyword"];
    if (!keyword || keyword.length == 0) {
        reject(@"1002", @"搜索关键词不能为空", nil);
        return;
    }
    
    RCTLogInfo(@"开始搜索建议: %@", keyword);
    
    // 保存Promise
    NSString *requestId = [NSString stringWithFormat:@"suggestion_search_%@", @([[NSDate date] timeIntervalSince1970])];
    self.pendingPromises[requestId] = @{@"resolve": resolve, @"reject": reject, @"type": @"suggestion_search"};
    
    // 创建搜索建议请求
    BMKSuggestionSearchOption *option = [[BMKSuggestionSearchOption alloc] init];
    option.keyword = keyword;
    
    if (options[@"city"]) {
        option.cityname = options[@"city"];
    }
    
    if (options[@"cityLimit"]) {
        option.cityLimit = [options[@"cityLimit"] boolValue];
    }
    
    BOOL success = [self.suggestionSearch suggestionSearch:option];
    if (!success) {
        [self.pendingPromises removeObjectForKey:requestId];
        reject(@"4004", @"搜索建议请求失败", nil);
    }
}

#pragma mark - BMKGeoCodeSearchDelegate

- (void)onGetGeoCodeResult:(BMKGeoCodeSearch *)searcher result:(BMKGeoCodeResult *)result errorCode:(BMKSearchErrorCode)error {
    // 找到对应的Promise
    NSString *requestId = nil;
    for (NSString *key in self.pendingPromises.allKeys) {
        NSDictionary *promiseInfo = self.pendingPromises[key];
        if ([promiseInfo[@"type"] isEqualToString:@"geocoding"]) {
            requestId = key;
            break;
        }
    }
    
    if (!requestId) {
        RCTLogError(@"未找到对应的地理编码Promise");
        return;
    }
    
    NSDictionary *promiseInfo = self.pendingPromises[requestId];
    RCTPromiseResolveBlock resolve = promiseInfo[@"resolve"];
    RCTPromiseRejectBlock reject = promiseInfo[@"reject"];
    
    [self.pendingPromises removeObjectForKey:requestId];
    
    if (error == BMK_SEARCH_NO_ERROR) {
        NSMutableDictionary *resultData = [NSMutableDictionary dictionary];
        resultData[@"success"] = @YES;
        
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        data[@"latitude"] = @(result.location.latitude);
        data[@"longitude"] = @(result.location.longitude);
        data[@"formattedAddress"] = result.address ?: @"";
        
        resultData[@"data"] = data;
        resolve(resultData);
        
        RCTLogInfo(@"地理编码成功: %f, %f", result.location.latitude, result.location.longitude);
    } else {
        NSString *errorMessage = [self getSearchErrorMessage:error];
        NSMutableDictionary *errorResult = [NSMutableDictionary dictionary];
        errorResult[@"success"] = @NO;
        errorResult[@"error"] = @{
            @"code": @"GEOCODING_ERROR",
            @"message": errorMessage
        };
        resolve(errorResult);
        
        RCTLogError(@"地理编码失败: %@", errorMessage);
    }
}

- (void)onGetReverseGeoCodeResult:(BMKGeoCodeSearch *)searcher result:(BMKReverseGeoCodeResult *)result errorCode:(BMKSearchErrorCode)error {
    // 找到对应的Promise
    NSString *requestId = nil;
    for (NSString *key in self.pendingPromises.allKeys) {
        NSDictionary *promiseInfo = self.pendingPromises[key];
        if ([promiseInfo[@"type"] isEqualToString:@"reverse_geocoding"]) {
            requestId = key;
            break;
        }
    }
    
    if (!requestId) {
        RCTLogError(@"未找到对应的逆地理编码Promise");
        return;
    }
    
    NSDictionary *promiseInfo = self.pendingPromises[requestId];
    RCTPromiseResolveBlock resolve = promiseInfo[@"resolve"];
    RCTPromiseRejectBlock reject = promiseInfo[@"reject"];
    
    [self.pendingPromises removeObjectForKey:requestId];
    
    if (error == BMK_SEARCH_NO_ERROR) {
        NSMutableDictionary *resultData = [NSMutableDictionary dictionary];
        resultData[@"success"] = @YES;
        
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        data[@"formattedAddress"] = result.address ?: @"";
        data[@"country"] = result.addressDetail.country ?: @"";
        data[@"province"] = result.addressDetail.province ?: @"";
        data[@"city"] = result.addressDetail.city ?: @"";
        data[@"district"] = result.addressDetail.district ?: @"";
        data[@"street"] = result.addressDetail.streetName ?: @"";
        data[@"streetNumber"] = result.addressDetail.streetNumber ?: @"";
        data[@"adCode"] = result.addressDetail.adCode ?: @"";
        data[@"business"] = result.business ?: @"";
        data[@"sematicDescription"] = result.sematicDescription ?: @"";
        
        resultData[@"data"] = data;
        resolve(resultData);
        
        RCTLogInfo(@"逆地理编码成功: %@", result.address);
    } else {
        NSString *errorMessage = [self getSearchErrorMessage:error];
        NSMutableDictionary *errorResult = [NSMutableDictionary dictionary];
        errorResult[@"success"] = @NO;
        errorResult[@"error"] = @{
            @"code": @"REVERSE_GEOCODING_ERROR",
            @"message": errorMessage
        };
        resolve(errorResult);
        
        RCTLogError(@"逆地理编码失败: %@", errorMessage);
    }
}

#pragma mark - BMKPoiSearchDelegate

- (void)onGetPoiResult:(BMKPoiSearch *)searcher result:(BMKPOISearchResult *)result errorCode:(BMKSearchErrorCode)error {
    // 找到对应的Promise
    NSString *requestId = nil;
    NSString *searchType = nil;
    for (NSString *key in self.pendingPromises.allKeys) {
        NSDictionary *promiseInfo = self.pendingPromises[key];
        if ([promiseInfo[@"type"] isEqualToString:@"poi_search"] || [promiseInfo[@"type"] isEqualToString:@"nearby_search"]) {
            requestId = key;
            searchType = promiseInfo[@"type"];
            break;
        }
    }
    
    if (!requestId) {
        RCTLogError(@"未找到对应的POI搜索Promise");
        return;
    }
    
    NSDictionary *promiseInfo = self.pendingPromises[requestId];
    RCTPromiseResolveBlock resolve = promiseInfo[@"resolve"];
    RCTPromiseRejectBlock reject = promiseInfo[@"reject"];
    
    [self.pendingPromises removeObjectForKey:requestId];
    
    if (error == BMK_SEARCH_NO_ERROR) {
        NSMutableDictionary *resultData = [NSMutableDictionary dictionary];
        resultData[@"success"] = @YES;
        
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        data[@"totalPageNumber"] = @(result.totalPOINum / 10 + (result.totalPOINum % 10 > 0 ? 1 : 0));
        data[@"totalResultNumber"] = @(result.totalPOINum);
        data[@"currentPageNumber"] = @(result.currentPageIndex);
        data[@"pageSize"] = @(result.poiInfoList.count);
        
        NSMutableArray *poiList = [NSMutableArray array];
        for (BMKPOIInfo *poi in result.poiInfoList) {
            NSMutableDictionary *poiData = [NSMutableDictionary dictionary];
            poiData[@"name"] = poi.name ?: @"";
            poiData[@"address"] = poi.address ?: @"";
            poiData[@"latitude"] = @(poi.pt.latitude);
            poiData[@"longitude"] = @(poi.pt.longitude);
            poiData[@"uid"] = poi.uid ?: @"";
            poiData[@"phone"] = poi.phone ?: @"";
            poiData[@"type"] = @(poi.epoitype);
            
            [poiList addObject:poiData];
        }
        data[@"poiInfoList"] = poiList;
        
        resultData[@"data"] = data;
        resolve(resultData);
        
        RCTLogInfo(@"POI搜索成功，找到 %lu 个结果", (unsigned long)result.poiInfoList.count);
    } else {
        NSString *errorMessage = [self getSearchErrorMessage:error];
        NSMutableDictionary *errorResult = [NSMutableDictionary dictionary];
        errorResult[@"success"] = @NO;
        errorResult[@"error"] = @{
            @"code": @"POI_SEARCH_ERROR",
            @"message": errorMessage
        };
        resolve(errorResult);
        
        RCTLogError(@"POI搜索失败: %@", errorMessage);
    }
}

#pragma mark - BMKSuggestionSearchDelegate

- (void)onGetSuggestionResult:(BMKSuggestionSearch *)searcher result:(BMKSuggestionSearchResult *)result errorCode:(BMKSearchErrorCode)error {
    // 找到对应的Promise
    NSString *requestId = nil;
    for (NSString *key in self.pendingPromises.allKeys) {
        NSDictionary *promiseInfo = self.pendingPromises[key];
        if ([promiseInfo[@"type"] isEqualToString:@"suggestion_search"]) {
            requestId = key;
            break;
        }
    }
    
    if (!requestId) {
        RCTLogError(@"未找到对应的搜索建议Promise");
        return;
    }
    
    NSDictionary *promiseInfo = self.pendingPromises[requestId];
    RCTPromiseResolveBlock resolve = promiseInfo[@"resolve"];
    RCTPromiseRejectBlock reject = promiseInfo[@"reject"];
    
    [self.pendingPromises removeObjectForKey:requestId];
    
    if (error == BMK_SEARCH_NO_ERROR) {
        NSMutableDictionary *resultData = [NSMutableDictionary dictionary];
        resultData[@"success"] = @YES;
        
        NSMutableArray *suggestionList = [NSMutableArray array];
        for (BMKSuggestionInfo *suggestion in result.suggestionList) {
            NSMutableDictionary *suggestionData = [NSMutableDictionary dictionary];
            suggestionData[@"key"] = suggestion.key ?: @"";
            suggestionData[@"city"] = suggestion.city ?: @"";
            suggestionData[@"district"] = suggestion.district ?: @"";
            suggestionData[@"uid"] = suggestion.uid ?: @"";
            
            if (suggestion.pt) {
                suggestionData[@"pt"] = @{
                    @"latitude": @(suggestion.pt.latitude),
                    @"longitude": @(suggestion.pt.longitude)
                };
            }
            
            [suggestionList addObject:suggestionData];
        }
        
        resultData[@"data"] = suggestionList;
        resolve(resultData);
        
        RCTLogInfo(@"搜索建议成功，找到 %lu 个建议", (unsigned long)result.suggestionList.count);
    } else {
        NSString *errorMessage = [self getSearchErrorMessage:error];
        NSMutableDictionary *errorResult = [NSMutableDictionary dictionary];
        errorResult[@"success"] = @NO;
        errorResult[@"error"] = @{
            @"code": @"SUGGESTION_SEARCH_ERROR",
            @"message": errorMessage
        };
        resolve(errorResult);
        
        RCTLogError(@"搜索建议失败: %@", errorMessage);
    }
}

#pragma mark - Helper Methods

- (NSString *)getSearchErrorMessage:(BMKSearchErrorCode)error {
    switch (error) {
        case BMK_SEARCH_AMBIGUOUS_KEYWORD:
            return @"检索词有岐义";
        case BMK_SEARCH_AMBIGUOUS_ROURE_ADDR:
            return @"检索地址有岐义";
        case BMK_SEARCH_NOT_SUPPORT_BUS:
            return @"该城市不支持公交搜索";
        case BMK_SEARCH_NOT_SUPPORT_BUS_2CITY:
            return @"不支持跨城市公交";
        case BMK_SEARCH_RESULT_NOT_FOUND:
            return @"没有找到检索结果";
        case BMK_SEARCH_ST_TIMEOUT:
            return @"搜索超时";
        case BMK_SEARCH_NETWOKR_ERROR:
            return @"网络连接错误";
        case BMK_SEARCH_NETWOKR_TIMEOUT:
            return @"网络连接超时";
        case BMK_SEARCH_PERMISSION_UNFINISHED:
            return @"还未完成鉴权，请在鉴权通过后重试";
        case BMK_SEARCH_INDOOR_ID_ERROR:
            return @"室内图ID错误";
        case BMK_SEARCH_FLOOR_ERROR:
            return @"室内图楼层错误";
        default:
            return @"未知搜索错误";
    }
}

- (void)dealloc {
    if (self.geoCodeSearch) {
        self.geoCodeSearch.delegate = nil;
        self.geoCodeSearch = nil;
    }
    
    if (self.poiSearch) {
        self.poiSearch.delegate = nil;
        self.poiSearch = nil;
    }
    
    if (self.suggestionSearch) {
        self.suggestionSearch.delegate = nil;
        self.suggestionSearch = nil;
    }
    
    [self.pendingPromises removeAllObjects];
}

@end