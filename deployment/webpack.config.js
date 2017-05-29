var path = require('path');
var BundleTracker = require('webpack-bundle-tracker');
var PROJECT_ROOT = path.resolve(__dirname, '../');

module.exports = {
  entry: './static/js/App.js',

  output: {
    filename: 'Glide.js',
    path: path.resolve(PROJECT_ROOT, 'static')
  },

  plugins: [
    new BundleTracker({
      filename: './webpack-stats.json'
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: path.resolve(PROJECT_ROOT, 'node_modules'),
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader',/*?limit=100000'*/
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: path.resolve(PROJECT_ROOT, 'node_modules'),
        options: {
          presets: [
            'es2015',
            'react'
          ]
        }
      }
    ]
  }
};
