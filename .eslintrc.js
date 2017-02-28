module.exports = {
  env: {
    node: true,
    mocha: true,
  },
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 6,
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  extends: 'standard',
  plugins: [
    'standard',
    'promise'
  ],
  globals: {
    'Promise': true
  }
};
