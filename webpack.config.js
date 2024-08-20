const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

require('dotenv').config();

// Check if we are in production mode
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // Define the mode based on the environment
  mode: isProduction ? 'production' : 'development',

  // Source maps for better debugging (different for development and production)
  devtool: isProduction ? 'source-map' : 'eval-source-map',

  // Resolve configuration for module imports
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'), // Provide fallback for "path" in the browser environment
    },
    extensions: ['.js', '.jsx'], // Resolve these extensions so imports don't need file extensions
  },

  // Entry point for the application
  entry: './src/index.js',

  // Output configuration for the bundled files
  output: {
    filename: '[name].[contenthash].js', // Use contenthash for cache busting
    path: path.resolve(__dirname, 'dist'), // Output directory as an absolute path
    clean: true, // Clean the output directory before each build
  },

  // Optimization settings for better performance
  optimization: {
    splitChunks: {
      chunks: 'all', // Split all chunks (including dynamic imports)
      minSize: 20000, // Minimum size for a chunk to be generated
      maxSize: 244000, // Maximum size before splitting a chunk
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/, // Split vendor modules from node_modules
          name: 'vendors', // Name of the vendor chunk
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },

  // Development server configuration
  devServer: {
    historyApiFallback: true, // Fallback to index.html for Single Page Applications
    static: {
      directory: path.join(__dirname, 'dist'), // Serve static files from this directory
    },
    compress: true, // Enable gzip compression for everything served
    port: 3000, // Port to run the development server on
  },

  // Module rules for different file types
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Match .js and .jsx files
        exclude: /node_modules/, // Exclude files in node_modules from being processed
        use: {
          loader: 'babel-loader', // Use Babel to transpile modern JavaScript and JSX
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Presets for environment and React
          },
        },
      },
      {
        test: /\.css$/, // Match .css files
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // Extract CSS in production, inject in development
          'css-loader', // Translates CSS into CommonJS modules
        ],
      },
    ],
  },

  // Plugins to enhance Webpack functionality
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML template to use
      inject: 'body', // Inject scripts into the body of the HTML
      minify: isProduction, // Minify the HTML in production mode
    }),
    // Conditionally add the Bundle Analyzer Plugin in production mode
    ...(isProduction
      ? [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static', // Generate a static HTML report
            openAnalyzer: true, // Automatically open the report after build
            reportFilename: 'bundle-report.html', // Output filename for the report
          }),
        ]
      : []),
    // Compress assets in production using gzip
    new CompressionPlugin({
      algorithm: 'gzip', // Use gzip compression
      test: /\.js$|\.css$|\.html$/, // Match JavaScript, CSS, and HTML files
      threshold: 10240, // Only compress files above 10KB
      minRatio: 0.8, // Compress files with a compression ratio above 0.8
    }),
    // Copy static files from the public folder to the output directory
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public', // Copy everything from the public folder
          to: '', // Copy to the root of the output directory
          globOptions: {
            ignore: ['**/index.html'], // Exclude index.html since HtmlWebpackPlugin handles it
          },
        },
      ],
    }),
    // Define environment variables for use in the application
    new DefinePlugin({
      'process.env': {
        REACT_APP_CLIENT_ID: JSON.stringify(process.env.REACT_APP_CLIENT_ID), // Inject the client ID
        REACT_APP_RAZORPAY_KEY_ID: JSON.stringify(process.env.REACT_APP_RAZORPAY_KEY_ID), // Inject the Razorpay key
        REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL), // Inject the API URL
      },
    }),
    // Conditionally add the MiniCssExtractPlugin in production mode
    ...(isProduction
      ? [
          new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css', // Extracted CSS filenames with content hash
          }),
        ]
      : []),
  ],
};
