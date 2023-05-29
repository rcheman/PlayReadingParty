const webpack = require('webpack');
const path = require('path');
const { node } = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'main.js',
  },
  mode: process.env.NODE_ENV,
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './public'),
      publicPath: '/',
    },
    port: 8080,
    // open: true,
    // hot: true,
    // liveReload: true,
    proxy: {
      '/api/actors': 'http://localhost:8000',
      '!/public': 'http://localhost:3000',
    },
    // Compression must be disabled, otherwise server sent events never get sent. Compression waits for ALL the data
    // before returning the response but server sent events keep sending data forever.
    compress: false
  },
};
