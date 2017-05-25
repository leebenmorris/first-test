const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  entry: {
    test: path.join(__dirname, 'spec', 'process-xml.spec.js'),
    'init-db': path.join(__dirname, 'db-config', 'init-db')
  },
  target: 'node',
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name]-bundle.js'
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
                  // targets the version of node running the build script
                  node: 'current'
                }
              }
            ]
          ],
          plugins: [
            'transform-runtime'
          ]
        }
      }
    ]
  }
};
