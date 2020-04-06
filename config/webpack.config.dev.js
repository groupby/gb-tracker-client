const path = require('path');
const packageJson = require('../package.json');

const version = packageJson.version;

/**
 * No minification.
 */
module.exports = {
  mode: "development",
  entry:  ['./dist/window.js'],
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: `${packageJson.name}-${version}.js`
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
