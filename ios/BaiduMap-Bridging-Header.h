//
//  BaiduMap-Bridging-Header.h
//  BaiduMap
//
//  Created by winyh on 2024/01/01.
//  Copyright © 2024 winyh. All rights reserved.
//

#ifndef BaiduMap_Bridging_Header_h
#define BaiduMap_Bridging_Header_h

// React Native
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTUIManager.h>

// 百度地图SDK
#import <BaiduMapAPI_Base/BMKBaseComponent.h>
#import <BaiduMapAPI_Map/BMKMapComponent.h>
#import <BaiduMapAPI_Search/BMKSearchComponent.h>
#import <BaiduMapAPI_Location/BMKLocationComponent.h>
#import <BaiduMapAPI_Utils/BMKUtilsComponent.h>

// 系统框架
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

#endif /* BaiduMap_Bridging_Header_h */