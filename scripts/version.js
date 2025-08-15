#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major

console.log(`🏷️  Bumping ${versionType} version...`);

// 读取当前版本
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current version: ${currentVersion}`);

// 使用 npm version 命令更新版本
try {
  const newVersion = execSync(`npm version ${versionType} --no-git-tag-version`, { 
    encoding: 'utf8' 
  }).trim();
  
  console.log(`New version: ${newVersion}`);
  
  // 更新 CHANGELOG.md
  updateChangelog(newVersion, currentVersion);
  
  // 提交更改
  if (args.includes('--commit')) {
    console.log('📝 Committing version changes...');
    execSync('git add package.json CHANGELOG.md');
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    execSync(`git tag ${newVersion}`);
    console.log(`✅ Version ${newVersion} committed and tagged`);
  }
  
  console.log('🎉 Version bump completed!');
  
} catch (error) {
  console.error('❌ Version bump failed:', error.message);
  process.exit(1);
}

function updateChangelog(newVersion, oldVersion) {
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  const today = new Date().toISOString().split('T')[0];
  
  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }
  
  // 在第一个版本条目之前插入新版本
  const versionHeader = `## [${newVersion}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n`;
  
  // 找到第一个 ## 的位置（如果存在）
  const firstVersionIndex = changelog.indexOf('\n## [');
  if (firstVersionIndex !== -1) {
    changelog = changelog.slice(0, firstVersionIndex + 1) + versionHeader + changelog.slice(firstVersionIndex + 1);
  } else {
    changelog += versionHeader;
  }
  
  fs.writeFileSync(changelogPath, changelog);
  console.log(`📝 Updated CHANGELOG.md for version ${newVersion}`);
}