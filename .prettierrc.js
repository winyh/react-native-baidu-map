module.exports = {
  // 基础配置
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // JSX 配置
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // 文件范围配置
  rangeStart: 0,
  rangeEnd: Infinity,

  // 解析器配置
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',

  // HTML 配置
  htmlWhitespaceSensitivity: 'css',

  // Vue 配置
  vueIndentScriptAndStyle: false,

  // 嵌入式语言格式化
  embeddedLanguageFormatting: 'auto',

  // 覆盖配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.{yaml,yml}',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
  ],
};