const packageJson = require('./package.json');

module.exports = {
  browser: {
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
  },
  node:    {
    target: 'node',
    entry:  ['./lib/gb-tracker-core.js'],
    output: {
      libraryTarget: 'commonjs2',
      filename:      `${packageJson.name}.js`
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
  }
};
