const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const { DefinePlugin } = require('webpack');

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },

  // Entry point for our application
  entry: './src/index.js',

  // Output settings
  output: {
    filename: '[name].[contenthash].js',  // Use contenthash for cache busting
    path: path.resolve(__dirname, 'dist'),
    clean: true,  // Automatically clean the output directory before each build
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },

  // Module rules for loaders
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,  // Matches .js and .jsx files
        exclude: /node_modules/,  // Exclude dependencies in node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',   // Transpile ES6+ to ES5
              '@babel/preset-react'  // Transpile JSX to JavaScript
            ]
          }
        }
      },
      {
        test: /\.css$/,  // Matches .css files
        use: ['style-loader', 'css-loader'],  // Use style-loader and css-loader
      }
    ]
  },

  // Plugins to enhance Webpack functionality
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // Specify our HTML template
      inject: 'body',  // Inject scripts into the body
      minify: isProduction,  // Minify the output HTML
    }),
    ...(isProduction ? [new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: true,
      reportFilename: 'bundle-report.html',
    })] : []),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new DefinePlugin({
      'process.env': {
        REACT_APP_CLIENT_ID: JSON.stringify(process.env.REACT_APP_CLIENT_ID),
        REACT_APP_RAZORPAY_KEY_ID: JSON.stringify(process.env.REACT_APP_RAZORPAY_KEY_ID),
        REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL),
  },
    }),
  ],

  // Resolve extensions
  resolve: {
    extensions: ['.js', '.jsx'],  // Resolve these extensions
  },

  // Other Webpack configurations...
};
