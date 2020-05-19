const path = require('path');
const packageJson = require('../package.json')

const version = packageJson.version;

// Based on:
// - https://webpack.js.org/guides/asset-management/ (for base Webpack config)
// - https://babeljs.io/docs/en/usage (for Babel config for babel-loader)
module.exports = {
  mode: 'production',
  entry: './dist/window.js',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: `${packageJson.name}-${version}.min.js`
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /core-js|core-js-compat/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  "useBuiltIns": "entry"
                }
              ]
            ],
            plugins: ['@babel/plugin-transform-regenerator']
          }
        }
      }
    ],
  }
};
