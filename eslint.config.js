const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expo,
  prettier,
  {
    ignores: ['node_modules/', '.expo/', 'dist/', 'web-build/', '.local/', 'supabase/'],
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
      sourceType: 'commonjs',
    },
  },
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
