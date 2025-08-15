#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// 清理之前的构建
console.log('🧹 Cleaning previous build...');
if (fs.existsSync('lib')) {
  fs.rmSync('lib', { recursive: true, force: true });
}

// 运行 TypeScript 编译
console.log('📦 Compiling TypeScript...');
try {
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation completed');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// 复制必要的文件
console.log('📋 Copying additional files...');
const filesToCopy = [
  { src: 'package.json', dest: 'lib/package.json' },
  { src: 'README.md', dest: 'lib/README.md' },
  { src: 'react-native.config.js', dest: 'lib/react-native.config.js' },
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`  ✓ Copied ${src} to ${dest}`);
  }
});

// 复制 Android 原生代码
console.log('📱 Copying Android native code...');
const androidSrc = 'android';
const androidDest = 'lib/android';

if (fs.existsSync(androidSrc)) {
  copyDirectory(androidSrc, androidDest);
  console.log('  ✓ Copied Android code');
}

// 验证构建结果
console.log('🔍 Validating build...');
const requiredFiles = [
  'lib/index.js',
  'lib/index.d.ts',
  'lib/components/index.js',
  'lib/modules/index.js',
  'lib/utils/index.js',
  'lib/types/index.js',
];

let buildValid = true;
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    buildValid = false;
  }
});

if (buildValid) {
  console.log('✅ Build validation passed');
  console.log('🎉 Build completed successfully!');
} else {
  console.error('❌ Build validation failed');
  process.exit(1);
}

// 显示构建统计
console.log('\n📊 Build Statistics:');
const libStats = getDirectoryStats('lib');
console.log(`  Files: ${libStats.files}`);
console.log(`  Size: ${formatBytes(libStats.size)}`);

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 跳过构建目录
      if (entry.name === 'build' || entry.name === '.gradle') {
        continue;
      }
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getDirectoryStats(dir) {
  let files = 0;
  let size = 0;

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else {
        files++;
        size += fs.statSync(fullPath).size;
      }
    }
  }

  if (fs.existsSync(dir)) {
    traverse(dir);
  }

  return { files, size };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}