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
  // 1. 全域忽略的產物
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/generated/**',
    '**/prisma.config.ts',
    '**/vitest.config.ts',
    '**/vitest.setup.ts',
  ]),

  // 2. 🌟 全域大一統配置：不分前後端，所有 JS/TS 檔案通通由 tsParser 處理
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

      // 關掉基礎 JS 的未用變數檢查，改用 TS 版（才不會對 JS 裡面的型別或特殊語法誤判）
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 3. 🎯 後端微調：只有後端 TS 需要對齊 tsconfig.json
  {
    files: ['apps/backend/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: `${import.meta.dirname}/apps/backend/tsconfig.json`,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error', // 後端強迫使用 import type
    },
  },

  // 4. 🎯 前端微調：只有前端需要載入 React 專屬插件與規則
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
      'react/prop-types': 0, // 既然有 TS 或純 JS，就不強迫寫 prop-types
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // 5. 全域 Prettier 格式化（永遠在最後）
  prettierRecommended,
]);
