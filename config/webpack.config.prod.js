const path = require('path');
const packageJson = require('../package.json')

const version = packageJson.version;

/**
 * Use minification (by using "production" mode) and no "beta.0" suffix on file name.
 */
module.exports = {
  mode: "production",
  entry:  ['./dist/window.js'],
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: `${packageJson.name}-${version}.min.js`
  },
  module: {
    rules: [
      {
        test:    /\.js$/,
        exclude: /node_modules/,
        loader:  'babel-loader'
      }
    ]
  }
};