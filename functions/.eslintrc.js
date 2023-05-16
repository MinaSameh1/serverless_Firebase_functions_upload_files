module.exports = {
  env: {
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-restricted-globals': ['error', 'name', 'length']
  },
  overrides: [
    {
      files: ['**/*.spec.*'],
      env: {
        mocha: true
      },
      rules: {
        'pretter/prettier': 'off'
      }
    }
  ],
  globals: {}
};
