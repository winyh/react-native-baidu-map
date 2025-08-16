# Contributing to React Native Baidu Map

首先，感谢您考虑为本项目做出贡献！我们欢迎任何形式的贡献，无论是报告 bug、提交功能请求，还是直接贡献代码。

## 本地开发设置

要在本地开发和测试此库，您需要设置 `example` 应用，该应用集成了本地的库代码。

### 1. 环境准备

- [Node.js](https://nodejs.org/) (>= 16.0.0)
- [Yarn](https://yarnpkg.com/)
- [Watchman](https://facebook.github.io/watchman/) (macOS)
- [CocoaPods](https://cocoapods.org/) (iOS 开发)
- [Android Studio](https://developer.android.com/studio) (Android 开发)
- 配置好 React Native 开发环境，详情请参考 [React Native 官方文档](https://reactnative.dev/docs/environment-setup)。

### 2. 克隆与安装

```bash
# 1. 克隆仓库
git clone https://github.com/winyh/react-native-baidu-map.git
cd react-native-baidu-map

# 2. 安装项目根目录的依赖
npm install

# 3. 运行 bootstrap 脚本来设置 example 应用
# 这会自动安装 example 的依赖并运行 pod install
npm run bootstrap
```

### 3. 运行 Example 应用

设置完成后，您可以像运行任何 React Native 应用一样运行 `example` 应用：

**运行 Android:**
```bash
npx react-native run-android --root example
```

**运行 iOS:**
```bash
npx react-native run-ios --root example
```

您在 `src` 目录下对库代码所做的任何更改，都会通过 Metro 实时反映在 `example` 应用中。

## 本地调试

调试库代码与调试标准的 React Native 应用类似。

- **JavaScript**: 您可以使用 [React DevTools](https://github.com/facebook/react/tree/main/packages/react-devtools) 或直接在浏览器中进行调试。
- **原生代码 (Android)**: 在 Android Studio 中打开 `/android` 文件夹，您可以在此设置断点、查看日志 (Logcat) 并进行调试。
- **原生代码 (iOS)**: 在 Xcode 中打开 `example/ios/BaiduMapExample.xcworkspace`，您可以在此设置断点、查看日志并进行调试。
- **启用调试模式**: 在 `BaiduMapModule.initialize` 配置中设置 `enableDebug: true` 可以开启 SDK 的调试日志，有助于排查问题。

## 测试

我们使用 Jest 进行单元和集成测试。请确保您的代码更改通过了所有测试。

```bash
# 运行所有测试
npm test

# 在 watch 模式下运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

在提交代码前，也请运行 linter 和类型检查：

```bash
npm run lint
npm run type-check
```

## 发布流程 (维护者指南)

本项目使用 [release-it](https://github.com/release-it/release-it) 来自动化版本发布流程。

### 发布准备 (首次发布)

在您第一次发布版本之前，请确保您已完成以下操作：

1.  **获取 npmjs.com 账户**: 确保您有一个 npm 账户，并且已被添加为本包 (`@react-native/winyh-baidu-map`) 的维护者。
2.  **登录 npm**: 在您的终端中，运行以下命令并根据提示输入您的 npm 用户名、密码和一次性密码 (OTP)。
    ```bash
    npm login
    ```
    您只需要在您的开发环境中登录一次。您可以通过 `npm whoami` 命令来检查当前的登录状态。

### 发布步骤

1.  确保您在 `main` 分支上，并且所有更改都已提交。
2.  运行发布命令：
    ```bash
    npm run release
    ```
3.  `release-it` 将会引导您完成后续步骤，包括：
    - 检查当前状态（git status, npm whoami 等）。
    - 根据 [Conventional Commits](https://www.conventionalcommits.org/) 规范自动生成版本号和 `CHANGELOG.md`。
    - 运行 `npm run ci`，包括 lint, test, build 等检查。
    - 提交版本文件，创建 git tag。
    - 将提交和 tag 推送到 GitHub。
    - 在 GitHub 上创建 Release。
    - 将新版本发布到 npm。

## 本地安装与测试

如果您想在自己的项目中使用本地修改过的版本进行测试，而不是从 npm 安装，可以使用 `npm pack`。

1.  在 `react-native-baidu-map` 的根目录中，运行打包命令：
    ```bash
    npm pack
    ```
    这会根据 `package.json` 中的 `files` 配置，将库打包成一个 `.tgz` 文件，例如 `react-native-winyh-baidu-map-1.0.0.tgz`。

2.  在您的测试项目中，通过指定文件路径来安装这个包：
    ```bash
    npm install /path/to/react-native-winyh-baidu-map-1.0.0.tgz
    ```

3.  验证功能后，在您的测试项目中卸载本地包，并重新从 npm 安装正式版本。
