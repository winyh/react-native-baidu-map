require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-baidu-map"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  React Native百度地图组件，基于百度地图Android SDK v7.6.5和iOS SDK v6.6.5开发。
                  支持地图显示、定位服务、标注管理、覆盖物绘制、地理编码、路径规划等功能。
                   DESC

  s.homepage     = package["homepage"]
  s.license      = { :type => "GPL-3.0-only", :file => "LICENSE" }
  s.authors      = { "winyh" => "2712192471@qq.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/winyh/react-native-baidu-map.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm,swift}"
  s.requires_arc = true

  # React Native依赖
  s.dependency "React-Core"

  # 百度地图SDK依赖
  s.vendored_frameworks = [
    "baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks/frameworks/基础地图/BaiduMapAPI_Base.framework",
    "baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks/frameworks/基础地图/BaiduMapAPI_Map.framework",
    "baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks/frameworks/基础地图/BaiduMapAPI_Search.framework",
    "baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks/frameworks/基础地图/BaiduMapAPI_Utils.framework"
  ]

  # 系统框架依赖
  s.frameworks = [
    "CoreLocation",
    "CoreTelephony", 
    "SystemConfiguration",
    "Security",
    "OpenGLES",
    "QuartzCore",
    "CoreGraphics",
    "AVFoundation",
    "JavaScriptCore",
    "GLKit",
    "ImageIO",
    "Accelerate"
  ]

  # 系统库依赖
  s.libraries = [
    "sqlite3.0",
    "c++",
    "z"
  ]

  # 编译设置
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386',
    'OTHER_LDFLAGS' => '-ObjC',
    'ENABLE_BITCODE' => 'NO'
  }

  s.user_target_xcconfig = { 
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386',
    'ENABLE_BITCODE' => 'NO'
  }

  # 资源文件
  s.resource_bundles = {
    'BaiduMapAPI_Map' => ['baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks/frameworks/基础地图/BaiduMapAPI_Map.framework/Resources/*.bundle']
  }

  # 预处理器定义
  s.compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1'
end