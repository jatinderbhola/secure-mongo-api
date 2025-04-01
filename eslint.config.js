// eslint.config.js
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: { js },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
]);
