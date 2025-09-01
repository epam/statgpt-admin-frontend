import { defineConfig, globalIgnores } from 'eslint/config';
import nx from '@nx/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    '**/node_modules',
    '**/next',
    '**/.next',
    '**/**.config.js',
    '**/**.config.mjs',
    '**/jest.config.ts',
    '**/**.spec.ts',
    '**/**.spec.tsx',
  ]),
  {
    extends: compat.extends('eslint:recommended', 'prettier', 'next'),

    plugins: {
      '@nx': nx,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'commonjs',

      parserOptions: {
        project: ['tsconfig.*?.json'],
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react-hooks/exhaustive-deps': 'error',

      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: true,
          allow: [],

          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],

      'no-empty': 'error',

      'no-console': [
        'error',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],

      'no-constant-condition': 'error',

      'no-multiple-empty-lines': [
        'warn',
        {
          max: 1,
          maxBOF: 0,
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    extends: compat.extends(
      'plugin:@nx/typescript',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/stylistic',
      'plugin:prettier/recommended',
    ),

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^__',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    extends: compat.extends('plugin:@nx/javascript'),
    rules: {},
  },
]);
