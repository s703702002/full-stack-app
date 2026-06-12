import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/generated/**',
    '**/prisma.config.ts',
    '**/vitest.config.ts',
    '**/vitest.setup.ts',
  ]),

  // 全域大一統配置：不分前後端，所有 JS/TS 檔案通通由 tsParser 處理
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser, // 統一使用 TS 解析器，它也完全看得懂純 JS
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser, // 允許瀏覽器全域變數 (前端)
        ...globals.node, // 允許 Node.js 全域變數 (後端)
        Express: 'readonly', // 照顧後端的 Express 型別
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules, // 基本 JS 規則
      ...tsPlugin.configs.recommended.rules, // 基本 TS 規則

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 只有前端需要載入 React 專屬插件與規則
  {
    files: ['apps/frontend/**/*.{js,jsx,ts,tsx}'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // 全域 Prettier 格式化（永遠在最後）
  prettierRecommended,
]);
