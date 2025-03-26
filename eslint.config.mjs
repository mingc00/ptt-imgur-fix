import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

const commonGlobals = ['createVideoEl', 'createImageEl', 'resolveAlbum', 'resolveUnknown'];

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.browser },
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['web.js', 'term.js'],
    languageOptions: {
      globals: Object.fromEntries(commonGlobals.map(name => [name, 'readonly'])),
    },
  },
  {
    files: ['imgur.js'],
    rules: {
      'no-unused-vars': ['error', {
        vars: 'all',
        varsIgnorePattern: `^(${commonGlobals.join('|')})$`,
      }],
    },
  },
  {
    files: ['background.js'],
    languageOptions: {
      globals: globals.webextensions,
    },
  },
  {
    files: ['surge/*.js'],
    languageOptions: {
      globals: {
        $response: 'readonly',
        $done: 'readonly',
      },
    },
  },
]);
