#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Running code quality checks...');

const checks = [
  {
    name: 'ESLint',
    command: 'npx eslint src/ example/ __tests__/ --ext .ts,.tsx,.js,.jsx',
    fix: 'npx eslint src/ example/ __tests__/ --ext .ts,.tsx,.js,.jsx --fix',
  },
  {
    name: 'Prettier',
    command: 'npx prettier --check "src/**/*.{ts,tsx,js,jsx}" "example/**/*.{ts,tsx,js,jsx}" "__tests__/**/*.{ts,tsx,js,jsx}"',
    fix: 'npx prettier --write "src/**/*.{ts,tsx,js,jsx}" "example/**/*.{ts,tsx,js,jsx}" "__tests__/**/*.{ts,tsx,js,jsx}"',
  },
  {
    name: 'TypeScript',
    command: 'npx tsc --noEmit',
    fix: null,
  },
];

const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const shouldFailFast = args.includes('--fail-fast');

let hasErrors = false;
const results = [];

for (const check of checks) {
  console.log(`\n🔧 Running ${check.name}...`);
  
  try {
    execSync(check.command, { stdio: 'inherit' });
    console.log(`✅ ${check.name} passed`);
    results.push({ name: check.name, status: 'passed' });
  } catch (error) {
    console.log(`❌ ${check.name} failed`);
    results.push({ name: check.name, status: 'failed' });
    hasErrors = true;
    
    if (shouldFix && check.fix) {
      console.log(`🔧 Attempting to fix ${check.name} issues...`);
      try {
        execSync(check.fix, { stdio: 'inherit' });
        console.log(`✅ ${check.name} issues fixed`);
        
        // Re-run the check to verify fixes
        execSync(check.command, { stdio: 'inherit' });
        console.log(`✅ ${check.name} passed after fixes`);
        results[results.length - 1].status = 'fixed';
        hasErrors = false;
      } catch (fixError) {
        console.log(`❌ Failed to fix ${check.name} issues`);
      }
    }
    
    if (shouldFailFast) {
      break;
    }
  }
}

// 显示总结
console.log('\n📊 Lint Results Summary:');
console.log('========================');
results.forEach(result => {
  const icon = result.status === 'passed' ? '✅' : 
               result.status === 'fixed' ? '🔧' : '❌';
  console.log(`${icon} ${result.name}: ${result.status}`);
});

// 运行额外检查
console.log('\n🔍 Running additional checks...');

// 检查未使用的依赖
try {
  console.log('📦 Checking for unused dependencies...');
  execSync('npx depcheck --ignores="@types/*,eslint-*,prettier,jest,@testing-library/*"', { stdio: 'inherit' });
  console.log('✅ No unused dependencies found');
} catch (error) {
  console.log('⚠️  Found unused dependencies (review recommended)');
}

// 检查安全漏洞
try {
  console.log('🔒 Checking for security vulnerabilities...');
  execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
  console.log('✅ No security vulnerabilities found');
} catch (error) {
  console.log('⚠️  Found security vulnerabilities (review recommended)');
}

// 检查包大小
try {
  console.log('📏 Analyzing bundle size...');
  if (fs.existsSync('lib')) {
    const { execSync } = require('child_process');
    const bundleSize = execSync('du -sh lib', { encoding: 'utf8' }).trim();
    console.log(`📦 Bundle size: ${bundleSize.split('\t')[0]}`);
  } else {
    console.log('⚠️  No build found, run npm run build first');
  }
} catch (error) {
  console.log('⚠️  Could not analyze bundle size');
}

if (hasErrors) {
  console.log('\n❌ Lint checks failed');
  process.exit(1);
} else {
  console.log('\n🎉 All lint checks passed!');
}