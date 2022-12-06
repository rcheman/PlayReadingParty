const webpack = require('webpack');
const path = require('path');
const { node } = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'main.js',
  },
  mode: 'development',
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
  devServer: {
    static: {
      directory: path.join(__dirname, './build'),
      publicPath: '/',
    },
    port: 9500,
    open: true,
    hot: true,
    liveReload: true,
  },
};
