// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  rules: {
    eqeqeq: 2,
    'no-duplicate-imports': 2,
    'block-scoped-var': 1,
    'import/no-nodejs-modules': 0,
    'github/prefer-observers': 0
  },
  plugins: ['github'],
  extends: ['plugin:github/browser', 'eslint:recommended', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 'latest',
    sourceType: 'module'
  }
}
