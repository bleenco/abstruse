const path = require('path');
const root = path.resolve(__dirname);
const webpack = require('webpack');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  context: __dirname,
  target: 'node',
  resolve: { extensions: ['.ts', '.js'] },
  entry: {
    index: path.join(root, 'src/api/index.ts')
  },
  output: {
    path: path.join(root, 'dist/api'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ],
  module: {
    rules: [
      { test: /\.ts$/, loaders: ['ts-loader?silent=true&configFile=src/tsconfig.api.json'] },
    ]
  },
  stats: {
    assets: false,
    chunks: false,
    chunkModules: false,
    colors: true,
    timings: true,
    children: false,
    cachedAssets: false,
    chunkOrigins: false,
    modules: false,
    warnings: false
  },
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },
  externals: {
    knex: 'commonjs knex',
    sqlite3: 'commonjs sqlite3',
    dockerode: 'commonjs dockerode',
    'rsa-compat-ssl': 'commonjs rsa-compat-ssl',
    bcrypt: 'commonjs bcrypt'
  },
  optimization: {
    minimizer: [new UglifyWebpackPlugin({
      parallel: true,
      cache: true
    })]
  }
};
