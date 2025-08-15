#!/bin/bash

# React Native百度地图iOS构建脚本

set -e

echo "🔨 开始构建React Native百度地图iOS项目..."

# 检查环境
if [ ! -d "ios" ]; then
    echo "❌ 错误：未找到ios目录"
    exit 1
fi

# 检查Xcode是否安装
if ! command -v xcodebuild >/dev/null 2>&1; then
    echo "❌ 错误：未找到Xcode，请确保已安装Xcode"
    exit 1
fi

# 检查CocoaPods是否安装
if ! command -v pod >/dev/null 2>&1; then
    echo "❌ 错误：未找到CocoaPods，请先安装CocoaPods"
    exit 1
fi

# 清理构建缓存
echo "🧹 清理构建缓存..."
cd ios
xcodebuild clean -workspace *.xcworkspace -scheme * || true
rm -rf build/
rm -rf DerivedData/

# 更新CocoaPods依赖
echo "📦 更新CocoaPods依赖..."
pod install --repo-update

# 构建项目
echo "🔨 开始构建项目..."
SCHEME_NAME=$(basename $(pwd))
WORKSPACE_NAME="${SCHEME_NAME}.xcworkspace"

if [ -f "$WORKSPACE_NAME" ]; then
    echo "使用workspace构建：$WORKSPACE_NAME"
    xcodebuild -workspace "$WORKSPACE_NAME" \
               -scheme "$SCHEME_NAME" \
               -configuration Release \
               -destination 'generic/platform=iOS' \
               build
else
    echo "❌ 错误：未找到workspace文件"
    exit 1
fi

cd ..

echo "✅ iOS项目构建完成！"