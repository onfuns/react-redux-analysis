const path = require('path')
const ManifestPlugin = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: [path.join(__dirname, `./index.js`)],
  devServer: {
    port: 9000,
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.less', '.png', '.jpg', 'json']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  devtool: 'eval-source-map',
  plugins: [
    new ManifestPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, `./index.html`),
    })
  ]
}
