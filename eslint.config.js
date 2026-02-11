import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default antfu({
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },
  ignores: [
    '**/skills/**',
    '.research/**',
  ],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'no-inner-declarations': 'error',
  },
  react: {
    overrides: {
      'react/no-implicit-key': 'off',
    },
  },
}, [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.md/**'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
]).append({
  plugins: {
    '@tanstack/query': pluginQuery,
  },
  rules: {
    'react-refresh/only-export-components': 'off',
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/no-rest-destructuring': 'warn',
    '@tanstack/query/stable-query-client': 'error',
    'test/consistent-test-it': 'error',
    'test/no-identical-title': 'error',
    'test/prefer-hooks-on-top': 'error',
  },
})
