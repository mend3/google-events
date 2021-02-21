module.exports = {
  env: {
    es2021: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['prettier', 'google'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['prettier', '@typescript-eslint'],
  rules: {
    'prettier/prettier': 'off',
    'object-curly-spacing': 'off',
    'arrow-parens': 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'no-unused-vars': 'warn',
    'camelcase': 'off',
  },
};
