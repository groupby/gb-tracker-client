const packageJson = require('./package.json');

module.exports = {
  entry:  ['./lib/gb-tracker-window.js'],
  output: {
    filename: `${packageJson.name}-${packageJson.version}.js`
  },
  module: {
    loaders: [
      {
        test:    /\.js$/,
        exclude: /node_modules/,
        loader:  'babel-loader'
      },
      {
        test:   /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
};
