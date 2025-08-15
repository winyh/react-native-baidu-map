# 百度地图 SDK 文件

请将以下百度地图 SDK 文件放置在此目录中：

## 必需文件

1. **BaiduLBS_Android.aar** - 百度地图和定位 SDK 主文件
   - 从百度开放平台下载最新版本
   - 建议版本：地图 SDK 7.6.0+，定位 SDK 9.5.2+

## 下载地址

- 百度开放平台：https://lbsyun.baidu.com/index.php?title=androidsdk/sdkandev-download
- 地图 SDK：https://lbsyun.baidu.com/index.php?title=androidsdk/sdkandev-download
- 定位 SDK：https://lbsyun.baidu.com/index.php?title=android-locsdk/geosdk-android-download

## 安装步骤

1. 下载对应的 SDK 文件
2. 将 `.aar` 文件复制到此目录
3. 在 `android/build.gradle` 中取消注释相关依赖行：
   ```gradle
   implementation files('libs/BaiduLBS_Android.aar')
   ```

## 注意事项

- 确保下载的 SDK 版本与项目要求兼容
- 不同版本的 SDK 可能有不同的 API 接口
- 建议使用最新稳定版本以获得最佳性能和功能支持

## 文件结构示例

```
android/libs/
├── README.md (本文件)
├── BaiduLBS_Android.aar
└── (其他可能的依赖文件)
```