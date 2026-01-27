import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      // TypeScript handles undefined variable checking, so no-undef is redundant
      // and produces false positives for browser globals
      'no-undef': 'off',
      // Allow single-line elements (the default multi-line enforcement is too strict)
      'vue/singleline-html-element-content-newline': 'off',
      // Allow multiple attributes on one line
      'vue/max-attributes-per-line': 'off',
      // Allow self-closing on void elements like <br/> and <input/>
      'vue/html-self-closing': 'off',
      // Relax component naming
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
);
