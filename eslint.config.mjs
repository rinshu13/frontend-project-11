import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: globals.browser
    }
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**']
  },
  {
    rules: {
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single']
    }
  }
]
