const packageJson = require('./package.json');

module.exports = {
  target: 'node',
  entry:   ['./lib/gb-tracker-core.js'],
  output:  {
    libraryTarget: 'commonjs2',
    filename: `${packageJson.name}.js`
  },
  module:  {
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
