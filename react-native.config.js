module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: '../node_modules/@react-native/winyh-baidu-map/android/',
        packageImportPath: 'import io.github.winyh.baidumap.BaiduMapPackage;',
      },
      ios: {
        sourceDir: '../node_modules/@react-native/winyh-baidu-map/ios/',
      },
    },
  },
};