const webpack     = require('webpack');
const packageJson = require('./package.json');

module.exports = {
  entry:   ['./lib/gb-tracker.js'],
  output:  {
    filename: `${packageJson.name}-${packageJson.version}.js`
  },
  module:  {
    loaders: [
      {
        test:   /\.json$/,
        loader: "json"
      }
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin()
  ]
};