const path = require('path');
const packageJson = require('../package.json');

const major = packageJson.version.split('.')[0];

module.exports = {
  mode: "development",
  entry:  ['./dist/window.js'],
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: `${packageJson.name}-${major}.js`
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
