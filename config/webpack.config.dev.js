const path = require('path');

const packageJson = require('../package.json');
const version = packageJson.version;

module.exports = {
  mode: 'development',
  entry: './dist/window.js',
  output: {
    path: path.resolve(__dirname, '../build'),
    filename: `${packageJson.name}-${version}.js`
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: [
          /\bcore-js\b/,
          /\bwebpack\b/,
          /\bregenerator-runtime\b/,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            presets: [
              [
                '@babel/env',
                {
                  targets: {
                    ie: '11',
                  },
                  useBuiltIns: 'usage',
                  corejs: '3',
                },
              ],
            ],
            plugins: [
              [
                '@babel/plugin-transform-runtime',
                {
                  corejs: '3',
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
