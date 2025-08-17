Pod::Spec.new do |s|
  s.name         = "BaiduMap"
  s.version      = "1.0.0"
  s.summary      = "React Native百度地图组件"
  s.description  = "基于百度地图iOS SDK v6.6.5的React Native地图组件，支持地图显示、定位、标注、覆盖物等功能"
  s.homepage     = "https://github.com/winyh/react-native-baidu-map"
  s.license      = { :type => "GPL-3.0-only", :file => "../LICENSE" }
  s.author       = { "winyh" => "2712192471@qq.com" }
  s.platform     = :ios, "9.0"
  s.source       = { :git => "https://github.com/winyh/react-native-baidu-map.git", :tag => "#{s.version}" }

  s.source_files = "*.{h,m}"
  s.requires_arc = true

  # React Native依赖
  s.dependency "React-Core"
  
  # 百度地图SDK依赖
  s.dependency "BaiduMapKit", "~> 6.6.5"
  
  # 系统框架依赖
  s.frameworks = "CoreLocation", "CoreTelephony", "SystemConfiguration", "Security", "OpenGLES", "QuartzCore", "CoreGraphics", "AVFoundation", "JavaScriptCore"
  s.libraries = "sqlite3.0", "c++", "z"
  
  # 编译设置
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386'
  }
  s.user_target_xcconfig = { 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386' }
end