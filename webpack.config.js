// eslint-disable-next-line import/no-unresolved
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const config = require('config');
const fs = require('fs');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const slsw = require('serverless-webpack');


fs.writeFileSync(path.resolve(__dirname, 'default.json'), JSON.stringify(config));

console.log('Config file:', JSON.stringify(config, null, '\t'));

const webpackConfig = {
  devtool: 'source-map',
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  node: {
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          __dirname,
          path.resolve(__dirname, 'src/entryPoints'),
          path.resolve(__dirname, 'src/services'),
          path.resolve(__dirname, 'src/middleware'),
          path.resolve(__dirname, 'src/utils'),
          path.resolve(__dirname, 'src/controllers'),
        ],
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new LodashModuleReplacementPlugin({
      paths: false,
    }),
    new CopyWebpackPlugin([

      path.resolve(__dirname, '.env'),
    ]),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|fr|hu|en-gb|en-ca/),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },

  // stats: {maxModules: Infinity, exclude: undefined},
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
  },
  resolve: {
    alias: {
      config: path.resolve(__dirname, 'default.json'),
    },
  },

  externals: [
    nodeExternals({
      whitelist: ['config'],
    }),
    {
      'aws-sdk': 'aws-sdk',
    },
  ],
};

module.exports = webpackConfig;
