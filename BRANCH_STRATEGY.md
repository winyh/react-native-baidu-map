# React Native百度地图 - 分支管理策略

## 分支结构

### 主要分支

#### `main` (主分支)
- **用途**: 生产环境代码，始终保持稳定可发布状态
- **保护**: 受保护分支，只能通过PR合并
- **发布**: 所有正式版本都从此分支发布
- **命名**: `main`

#### `develop` (开发分支)
- **用途**: 开发环境代码，集成最新功能
- **来源**: 从main分支创建
- **合并**: 功能分支合并到此分支
- **发布**: 预发布版本从此分支发布
- **命名**: `develop`

### 功能分支

#### `feature/*` (功能开发分支)
- **用途**: 开发新功能
- **来源**: 从develop分支创建
- **合并**: 完成后合并回develop分支
- **命名规范**: 
  - `feature/android-sdk-integration` - Android SDK集成
  - `feature/ios-sdk-integration` - iOS SDK集成
  - `feature/map-components` - 地图组件开发
  - `feature/location-services` - 定位服务
  - `feature/performance-optimization` - 性能优化

#### `bugfix/*` (Bug修复分支)
- **用途**: 修复开发环境中的Bug
- **来源**: 从develop分支创建
- **合并**: 修复后合并回develop分支
- **命名规范**: 
  - `bugfix/map-rendering-issue` - 地图渲染问题
  - `bugfix/location-accuracy` - 定位精度问题

#### `hotfix/*` (热修复分支)
- **用途**: 修复生产环境紧急Bug
- **来源**: 从main分支创建
- **合并**: 同时合并到main和develop分支
- **命名规范**: 
  - `hotfix/critical-crash-fix` - 关键崩溃修复
  - `hotfix/security-patch` - 安全补丁

#### `release/*` (发布分支)
- **用途**: 准备新版本发布
- **来源**: 从develop分支创建
- **合并**: 完成后合并到main和develop分支
- **命名规范**: 
  - `release/v1.0.0` - 1.0.0版本发布
  - `release/v1.1.0` - 1.1.0版本发布

### 支持分支

#### `docs/*` (文档分支)
- **用途**: 文档更新和维护
- **来源**: 从develop分支创建
- **合并**: 合并回develop分支
- **命名规范**: 
  - `docs/api-documentation` - API文档更新
  - `docs/installation-guide` - 安装指南更新

#### `chore/*` (维护分支)
- **用途**: 构建、配置、依赖更新等维护工作
- **来源**: 从develop分支创建
- **合并**: 合并回develop分支
- **命名规范**: 
  - `chore/update-dependencies` - 依赖更新
  - `chore/ci-cd-setup` - CI/CD配置

## 工作流程

### 1. 功能开发流程
```bash
# 1. 从develop创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 开发功能
# ... 编码工作 ...

# 3. 提交代码
git add .
git commit -m "feat: add new feature"

# 4. 推送分支
git push origin feature/new-feature

# 5. 创建Pull Request到develop分支
# 6. 代码审查通过后合并
# 7. 删除功能分支
```

### 2. 发布流程
```bash
# 1. 从develop创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. 版本准备工作
npm run version:minor
npm run build
npm run test

# 3. 提交版本更新
git add .
git commit -m "chore: prepare release v1.0.0"

# 4. 推送发布分支
git push origin release/v1.0.0

# 5. 创建PR到main分支
# 6. 合并到main后创建tag
git checkout main
git pull origin main
git tag v1.0.0
git push origin v1.0.0

# 7. 将发布分支合并回develop
git checkout develop
git merge release/v1.0.0
git push origin develop
```

### 3. 热修复流程
```bash
# 1. 从main创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. 修复问题
# ... 修复代码 ...

# 3. 提交修复
git add .
git commit -m "fix: critical issue fix"

# 4. 推送分支
git push origin hotfix/critical-fix

# 5. 创建PR到main分支
# 6. 合并后创建补丁版本tag
git checkout main
git pull origin main
git tag v1.0.1
git push origin v1.0.1

# 7. 将热修复合并回develop
git checkout develop
git merge hotfix/critical-fix
git push origin develop
```

## 分支保护规则

### main分支保护
- 禁止直接推送
- 要求Pull Request审查
- 要求状态检查通过
- 要求分支为最新状态
- 限制推送权限

### develop分支保护
- 禁止直接推送
- 要求Pull Request审查
- 要求状态检查通过

## 提交信息规范

### 提交类型
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `ci`: CI/CD相关

### 提交格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 示例
```
feat(android): add baidu map integration

- Integrate Baidu Map Android SDK v7.6.5
- Implement map view component
- Add location services

Closes #123
```

## 版本管理

### 语义化版本
- `MAJOR.MINOR.PATCH` (如: 1.0.0)
- `MAJOR`: 不兼容的API变更
- `MINOR`: 向后兼容的功能新增
- `PATCH`: 向后兼容的Bug修复

### 预发布版本
- `1.0.0-alpha.1`: Alpha版本
- `1.0.0-beta.1`: Beta版本
- `1.0.0-rc.1`: Release Candidate版本

## 当前分支规划

基于项目现状，建议按以下顺序创建和开发：

### 第一阶段 - 基础架构
1. `main` - 主分支（当前代码）
2. `develop` - 开发分支
3. `feature/android-core` - Android核心功能
4. `feature/ios-core` - iOS核心功能

### 第二阶段 - 功能完善
1. `feature/map-components` - 地图组件
2. `feature/location-services` - 定位服务
3. `feature/annotation-overlay` - 标注和覆盖物
4. `feature/geocoding` - 地理编码

### 第三阶段 - 优化和发布
1. `feature/performance-optimization` - 性能优化
2. `feature/testing` - 测试完善
3. `docs/api-documentation` - 文档完善
4. `release/v1.0.0` - 首个正式版本

## 协作规范

### Pull Request规范
1. 标题清晰描述变更内容
2. 详细描述变更原因和影响
3. 关联相关Issue
4. 添加适当的标签
5. 指定审查者

### 代码审查要点
1. 代码质量和规范
2. 功能正确性
3. 性能影响
4. 安全性考虑
5. 测试覆盖率
6. 文档完整性

### 合并策略
- 功能分支: Squash and merge
- 发布分支: Create a merge commit
- 热修复分支: Create a merge commit