# 百度地图SDK安装指南

本项目需要手动下载并配置百度地图SDK。为了减少仓库大小，SDK文件不包含在代码仓库中。

## Android SDK

### 下载地址
- **百度地图Android SDK v7.6.5**
- 官方下载：https://lbsyun.baidu.com/index.php?title=androidsdk/sdkandev-download
- 文档：https://lbsyun.baidu.com/index.php?title=androidsdk

### 安装步骤
1. 下载 `BaiduLBS_Android_V7.6.5.zip`
2. 解压到项目根目录的 `baidu/android/` 文件夹
3. 确保目录结构为：
   ```
   baidu/android/BaiduLBS_Android_V7.6.5/
   ├── libs/
   │   ├── BaiduLBS_Android.jar
   │   └── arm64-v8a/
   │       └── libBaiduMapSDK_*.so
   └── ...
   ```

## iOS SDK

### 下载地址
- **百度地图iOS SDK v6.6.5**
- 官方下载：https://lbsyun.baidu.com/index.php?title=iossdk/sdkandev-download
- 文档：https://lbsyun.baidu.com/index.php?title=iossdk

### 安装步骤
1. 下载 `BaiduMap_IOSSDK_v6.6.5.zip`
2. 解压到项目根目录的 `baidu/ios/` 文件夹
3. 确保目录结构为：
   ```
   baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks/
   ├── frameworks/
   │   ├── 基础地图/
   │   │   ├── BaiduMapAPI_Base.framework
   │   │   └── BaiduMapAPI_Map.framework
   │   ├── 检索功能/
   │   │   └── BaiduMapAPI_Search.framework
   │   └── ...
   └── ...
   ```

## 验证安装

安装完成后，运行以下命令验证SDK是否正确安装：

```bash
# 检查Android SDK
ls -la baidu/android/BaiduLBS_Android_V7.6.5/libs/

# 检查iOS SDK
ls -la baidu/ios/BaiduMap_IOSSDK_v6.6.5_Frameworks/frameworks/
```

## 注意事项

1. **版本兼容性**：请确保下载的SDK版本与项目中配置的版本一致
2. **许可证**：使用百度地图SDK需要申请API Key，请访问[百度地图开放平台](https://lbsyun.baidu.com/)
3. **更新**：SDK更新时，请同步更新本文档中的版本号

## 常见问题

### Q: 为什么不直接包含SDK文件？
A: 百度地图SDK文件较大（总计约4.6GB），为了保持仓库轻量化，我们选择在文档中说明下载方式。

### Q: 如何获取API Key？
A: 请访问[百度地图开放平台控制台](https://lbsyun.baidu.com/apiconsole/key)申请API Key。

### Q: SDK版本如何选择？
A: 建议使用本项目测试过的版本：Android SDK v7.6.5 和 iOS SDK v6.6.5。