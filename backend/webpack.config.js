const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  entry: {
    'process-xml': './lambda-functions/process-xml.js',
  },
  target: 'node',
  externals: [
    nodeExternals() // all dev dependencies
  ],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: [
            [
              'env',
              {
                targets: {
                  node: '6.10'
                }
              }
            ],
            'babili'
          ]
        }
      }
    ]
  }
};