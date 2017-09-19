const { resolve } = require('path');
const AoTPlugin = require('@ngtools/webpack').AotPlugin;
const webpackMerge = require('webpack-merge');
const compression = require('compression-webpack-plugin');
const html = require('html-webpack-plugin');
const copy = require('copy-webpack-plugin');
const extract = require('extract-text-webpack-plugin');
const portfinder = require('portfinder');

module.exports = function (options, webpackOptions) {
  options = options || {};

  let config = {};

  config = webpackMerge({}, config, {
    entry: getEntry(options),
    resolve: { extensions: ['.ts', '.js', '.json'] },
    output: {
      path: root('dist/app')
    },
    module: {
      rules: [
        { test: /\.html$/, loader: 'raw-loader' },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.(jp?g|png|gif|ico)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'images/[hash].[ext]' } },
        { test: /\.(eot|woff2?|svg|ttf|otf)([\?]?.*)$/, loader: 'file-loader', options: { hash: 'sha512', digest: 'hex', name: 'fonts/[hash].[ext]' } }
      ]
    },
    plugins: [
      new copy([
        { context: './src/app/assets/public', from: '**/*' },
        { context: './node_modules/monaco-editor/min/', from: '**/*', to: 'monaco' }
      ]),
    ]
  });

  config = webpackMerge({}, config, {
    output: {
      filename: 'js/app.js'
    },
    target: 'web',
    plugins: [
      new html({ template: root('src/app/index.html'), output: root('dist') })
    ],
    devServer: {
      historyApiFallback: true,
      port: 8000,
      open: true,
      hot: false,
      inline: true,
      stats: {
        errors: true,
        errorDetails: true,
        depth: false,
        chunkOrigins: false,
        chunkModules: false,
        chunks: false,
        children: false,
        cacheAssets: false,
        cached: false,
        assets: false,
        modules: false,
        hash: false,
        reasons: false,
        source: false,
        timings: true,
        version: false,
        warnings: false,
        colors: true
      },
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
    }
  });

  if (options.prod) {
    config = webpackMerge({}, config, getProductionPlugins());
    config = webpackMerge({}, config, getProdStylesConfig());
  } else {
    config = webpackMerge({}, config, getDevStylesConfig());
    config = webpackMerge({}, config, { devtool: 'cheap-module-inline-source-map' });
  }

  if (options.aot) {
    console.log(`Running build with AoT compilation...`)

    config = webpackMerge({}, config, {
      module: {
        rules: [{ test: /\.ts$/, loader: '@ngtools/webpack' }]
      },
      plugins: [
        new AoTPlugin({
          tsConfigPath: root('src/app/tsconfig.json')
        })
      ]
    });
  } else {
    config = webpackMerge({}, config, {
      module: {
        rules: [{ test: /\.ts$/, loader: '@ngtools/webpack' }]
      },
      plugins: [
        new AoTPlugin({
          tsConfigPath: root('src/app/tsconfig.json'),
          skipCodeGeneration: true
        })
      ]
    });
  }

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

function getEntry(options) {
  if (options.aot) {
    return { app: root('src/app/main.aot.ts') };
  } else {
    return { app: root('src/app/main.ts') };
  }
}

function getProductionPlugins() {
  return {
    plugins: [
      new compression({ asset: "[path].gz[query]", algorithm: "gzip", test: /\.js$|\.html$/, threshold: 10240, minRatio: 0.8 })
    ]
  }
}

function getDevStylesConfig() {
  return {
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader'], exclude: [root('src/app')] },
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
      new extract('css/[name].css')
    ],
    module: {
      rules: [
        { test: /\.css$/, use: extract.extract({ fallback: 'style-loader', use: 'css-loader' }), include: [root('src/app/styles')] },
        { test: /\.css$/, use: ['to-string-loader', 'css-loader'], exclude: [root('src/app/styles')] },
        { test: /\.scss$|\.sass$/, loader: extract.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }), exclude: [root('src/app/app')] },
        { test: /\.scss$|\.sass$/, use: ['to-string-loader', 'css-loader', 'sass-loader'], exclude: [root('src/app/styles')] },
      ]
    }
  };
}
