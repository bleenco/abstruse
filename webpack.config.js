const { resolve } = require('path');
const { AngularCompilerPlugin } = require('@ngtools/webpack');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const compression = require('compression-webpack-plugin');
const html = require('html-webpack-plugin');
const copy = require('copy-webpack-plugin');
const extract = require('extract-text-webpack-plugin');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');
const portfinder = require('portfinder');
const nodeModules = resolve(__dirname, 'node_modules');
const entryPoints = ["inline", "polyfills", "sw-register", "styles", "vendor", "app"];

module.exports = function (options, webpackOptions) {
  options = options || {};

  let config = {};

  config = webpackMerge({}, config, {
    entry: {
      app: webpackOptions.p ? root('src/app/main.prod.ts') : root('src/app/main.ts'),
      styles: root('src/app/styles.ts'),
      polyfills: root('src/app/polyfills.ts')
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      modules: ['node_modules', nodeModules]
    },
    resolveLoader: {
      modules: [nodeModules, 'node_modules']
    },
    module: {
      rules: [
        { test: /\.html$/, loader: 'html-loader', options: { minimize: true, removeAttributeQuotes: false, caseSensitive: true, customAttrSurround: [ [/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/] ], customAttrAssign: [ /\)?\]?=/ ] } },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.(jp?g|png|gif)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'images/[hash].[ext]' } },
        { test: /\.(eot|woff2?|svg|ttf|otf)([\?]?.*)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'fonts/[hash].[ext]' } }
      ]
    },
    plugins: [
      new copy([
        { context: './src/app/assets/public', from: '**/*' },
        { context: './node_modules/monaco-editor/min/', from: '**/*', to: 'monaco' }
      ]),
    ],
    stats: 'minimal'
  });

  config = webpackMerge({}, config, {
    output: {
      path: root('dist/app'),
      filename: 'js/[name].bundle.js',
      chunkFilename: 'js/[id].chunk.js'
    },
    plugins: [
      new html({
        template: root('src/app/index.html'),
        output: root('dist'),
        chunksSortMode: sort = (left, right) => {
          let leftIndex = entryPoints.indexOf(left.names[0]);
          let rightindex = entryPoints.indexOf(right.names[0]);
          if (leftIndex > rightindex) {
            return 1;
          } else if (leftIndex < rightindex) {
            return -1;
          } else {
            return 0;
          }
        }
      })
    ],
    devServer: {
      historyApiFallback: true,
      port: 8000,
      open: true,
      hot: false,
      inline: true,
      overlay: true,
      stats: 'minimal',
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
    }
  });

  if (webpackOptions.p) {
    config = webpackMerge({}, config, getProductionPlugins());
    config = webpackMerge({}, config, getProdStylesConfig());
  } else {
    config = webpackMerge({}, config, getDevelopmentConfig());
    config = webpackMerge({}, config, getDevStylesConfig());
  }


  config = webpackMerge({}, config, {
    module: {
      rules: [
        { test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/, loader: '@ngtools/webpack' },
        { test: /node_modules.+xterm.+\.map$/, loader: 'ignore-loader' }
      ]
    },
    plugins: [
      new AngularCompilerPlugin({ tsConfigPath: root('src/app/tsconfig.json') })
    ]
  });

  if (options.serve) {
    return portfinder.getPortPromise().then(port => {
      config.devServer.port = port;
      return config;
    });
  } else {
    return Promise.resolve(config);
  }
}

function root(path) {
  return resolve(__dirname, path);
}

function getDevelopmentConfig() {
  return {
    devtool: 'inline-source-map',
    module: {
      rules: [
        { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader', exclude: [nodeModules] }
      ]
    },
    plugins: [
      new webpack.EnvironmentPlugin({ 'NODE_ENV': 'development' }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        minChunks: Infinity,
        name: 'inline'
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: ['app'],
        minChunks: module => {
          return module.resource && module.resource.startsWith(nodeModules)
        }
      })
    ]
  };
}

function getProductionPlugins() {
  return {
    plugins: [
      new webpack.EnvironmentPlugin({ 'NODE_ENV': 'production' }),
      new compression({ asset: "[path].gz[query]", algorithm: "gzip", test: /\.js$|\.html$/, threshold: 10240, minRatio: 0.8 }),
      new LicenseWebpackPlugin({ pattern: /^(MIT|ISC|BSD.*)$/, suppressErrors: true, perChunkOutput: false, outputFilename: `3rdpartylicenses.txt` })
    ]
  };
}

function getDevStylesConfig() {
  return {
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader'], include: [root('src/app/styles')] },
        { test: /\.css$/, use: ['to-string-loader', 'css-loader'], exclude: [root('src/app/styles')] },
        { test: /\.scss$|\.sass$/, use: ['style-loader', 'css-loader', 'sass-loader'], include: [root('src/app/styles') ] },
        { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'sass-loader'], exclude: [root('src/app/styles')] },
      ]
    }
  };
}

function getProdStylesConfig() {
  return {
    plugins: [
      new extract('css/[hash].css')
    ],
    module: {
      rules: [
        { test: /\.css$/, use: extract.extract({ fallback: 'style-loader', use: 'css-loader' }), include: [root('src/app/styles')] },
        { test: /\.css$/, use: ['to-string-loader', 'css-loader'], exclude: [root('src/app/styles')] },
        { test: /\.scss$|\.sass$/, loader: extract.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }), exclude: [root('src/app/components'), root('node_modules')] },
        { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'sass-loader'], exclude: [root('src/app/styles')] }
      ]
    }
  };
}
