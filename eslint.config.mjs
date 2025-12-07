// eslint.config.js (flat config для ESLint 9+)
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    languageOptions: {
      ecmaVersion: 2021,  // ES2021 для Vite/ES-модулей
      sourceType: 'module',  // import/export
      globals: globals.browser  // Глобалы: document, window и т.д.
    }
  },
  js.configs.recommended,  // Рекомендованные правила
  {
    files: ['**/*.js'],  // Все .js файлы
    ignores: ['node_modules/**', 'dist/**']  // Игнор ненужного
  },
  {
    rules: {
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',  // Игнор аргументов с префиксом _ (стандарт)
        'varsIgnorePattern': '^_'   // Для переменных тоже
      }],  // Снижает до warn и игнорит _
      'semi': ['error', 'always'],  // Точка с запятой
      'quotes': ['error', 'single']  // Одинарные кавычки
    }
  }
];
