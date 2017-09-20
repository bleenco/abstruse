const path = require('path');
const root = path.resolve(__dirname);
const webpack = require('webpack');
const uglify = require('uglifyjs-webpack-plugin');

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
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new uglify()
  ],
  module: {
    rules: [
      { test: /\.ts$/, loaders: ['ts-loader?silent=true'] },
    ]
  },
  stats: {
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
    'dockerode': 'commonjs dockerode'
  }
};
