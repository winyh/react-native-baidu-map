#!/bin/bash

# React Native百度地图iOS安装后脚本
# 用于配置百度地图SDK和相关依赖

set -e

echo "🚀 开始配置React Native百度地图iOS环境..."

# 检查是否在iOS项目目录中
if [ ! -d "ios" ]; then
    echo "❌ 错误：未找到ios目录，请在React Native项目根目录运行此脚本"
    exit 1
fi

# 检查百度地图SDK是否存在
BAIDU_SDK_PATH="node_modules/react-native-baidu-map/baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks"
if [ ! -d "$BAIDU_SDK_PATH" ]; then
    echo "❌ 错误：未找到百度地图iOS SDK，请确保SDK文件已正确安装"
    exit 1
fi

echo "✅ 百度地图iOS SDK检查通过"

# 检查Podfile是否存在
if [ ! -f "ios/Podfile" ]; then
    echo "❌ 错误：未找到Podfile，请确保已初始化CocoaPods"
    exit 1
fi

# 检查Podfile中是否已添加百度地图依赖
if ! grep -q "react-native-baidu-map" ios/Podfile; then
    echo "📝 正在添加百度地图依赖到Podfile..."
    
    # 在Podfile中添加依赖
    sed -i '' '/use_react_native!/a\
  pod '\''react-native-baidu-map'\'', :path => '\''../node_modules/react-native-baidu-map'\''
' ios/Podfile
    
    echo "✅ 已添加百度地图依赖到Podfile"
else
    echo "✅ Podfile中已存在百度地图依赖"
fi

# 检查Info.plist配置
INFO_PLIST_PATH="ios/$(basename $(pwd))/Info.plist"
if [ -f "$INFO_PLIST_PATH" ]; then
    echo "📝 正在检查Info.plist配置..."
    
    # 检查位置权限配置
    if ! grep -q "NSLocationWhenInUseUsageDescription" "$INFO_PLIST_PATH"; then
        echo "⚠️  警告：Info.plist中缺少位置权限配置，请手动添加以下配置："
        echo "   <key>NSLocationWhenInUseUsageDescription</key>"
        echo "   <string>此应用需要访问您的位置信息以在地图上显示您的当前位置</string>"
    else
        echo "✅ 位置权限配置检查通过"
    fi
else
    echo "⚠️  警告：未找到Info.plist文件，请确保项目配置正确"
fi

# 安装CocoaPods依赖
echo "📦 正在安装CocoaPods依赖..."
cd ios
if command -v pod >/dev/null 2>&1; then
    pod install --repo-update
    echo "✅ CocoaPods依赖安装完成"
else
    echo "❌ 错误：未找到CocoaPods，请先安装CocoaPods"
    echo "   安装命令：sudo gem install cocoapods"
    exit 1
fi

cd ..

# 创建示例配置文件
EXAMPLE_CONFIG_PATH="ios/BaiduMapConfig.example.plist"
if [ ! -f "$EXAMPLE_CONFIG_PATH" ]; then
    echo "📝 正在创建示例配置文件..."
    cat > "$EXAMPLE_CONFIG_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>BaiduMapAPIKey</key>
    <string>YOUR_BAIDU_MAP_API_KEY_HERE</string>
    
    <key>BaiduMapSDKVersion</key>
    <string>6.6.5</string>
    
    <key>EnableDebugMode</key>
    <true/>
</dict>
</plist>
EOF
    echo "✅ 已创建示例配置文件：$EXAMPLE_CONFIG_PATH"
fi

echo ""
echo "🎉 React Native百度地图iOS环境配置完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 在百度地图开放平台申请iOS应用的API Key"
echo "2. 将API Key添加到AppDelegate.m中的SDK初始化代码"
echo "3. 确保Info.plist中包含必要的权限配置"
echo "4. 运行 'npx react-native run-ios' 启动应用"
echo ""
echo "📚 更多信息请参考："
echo "   - 百度地图iOS SDK文档：https://lbsyun.baidu.com/index.php?title=iossdk"
echo "   - 项目README文档"
echo ""