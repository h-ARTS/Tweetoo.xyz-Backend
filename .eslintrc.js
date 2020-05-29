module.exports = {
  parserOptions: {
    sourceType: 'module'
  },
  parser: 'babel-eslint',
  env: {
    node: true
  },
  extends: [
    'standard',
    'plugin:jest/recommended',
    'prettier',
    'prettier/standard'
  ],
  plugins: ['prettier', 'jest'],
  rules: {
    'promise/catch-or-return': 'error',
    'prettier/prettier': ['error']
  }
}
