const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  entry: {
    'process-xml': path.join(__dirname, 'src', 'process-xml.js'),
    'get-debit-items': path.join(__dirname, 'src', 'get-debit-items.js')
  },
  target: 'node',
  externals: [
    // exclude all dev dependencies
    nodeExternals() 
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
              // using babel env preset to specifically target the 6.10 environment in AWS Lambda
              'env',    
              {
                targets: {
                  node: '6.10'
                }
              }
            ],
            // using babel babili preset to minify code
            'babili'    
          ]
        }
      }
    ]
  }
};