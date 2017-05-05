const { root } = require('./helpers');
const webpack = require('webpack');
const dll = require('webpack-dll-bundles-plugin').DllBundlesPlugin;
const assethtml = require('add-asset-html-webpack-plugin');

module.exports = {
  entry: root('src/app/main.ts'),
  output: {
    path: root('dist/app'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].bundle.map',
    chunkFilename: '[id].chunk.js',
    library: '[name]',
    libraryTarget: 'var'
  },
  devtool: 'source-map',
  plugins: [
    new dll({
      bundles: {
        polyfills: [
          'core-js',
          { name: 'zone.js', path: 'zone.js/dist/zone.js' },
          { name: 'zone.js', path: 'zone.js/dist/long-stack-trace-zone.js' }
        ],
        vendor: [
          '@angular/platform-browser', '@angular/platform-browser-dynamic', '@angular/core',
          '@angular/common', '@angular/forms', '@angular/http', '@angular/router', 'rxjs'
        ]
      },
      dllDir: root('dist/app'),
      webpackConfig: { devtool: 'cheap-module-source-map', plugins: [] }
    }),
    new assethtml([
      { filepath: root(`dist/app/${dll.resolveFile('polyfills')}`) },
      { filepath: root(`dist/app/${dll.resolveFile('vendor')}`) }
    ])
  ]
}
