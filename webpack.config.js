const webpackMerge = require('webpack-merge');
const commonPartial = require('./webpack/webpack.common');
const prodPartial = require('./webpack/webpack.prod');
const devPartial = require('./webpack/webpack.dev');
const { getAotPlugin } = require('./webpack/webpack.aot');
const { root } = require('./webpack/helpers');
const { getDevStylesConfig, getProdStylesConfig } = require('./webpack/webpack.style');
const portfinder = require('portfinder');

module.exports = function (options, webpackOptions) {
  options = options || {};

  if (options.aot) {
    console.log('Running build with AoT compilation...');
  }

  let config = webpackMerge({}, commonPartial, {
    plugins: [
      getAotPlugin(!!options.aot)
    ]
  }, options.dev ? getDevStylesConfig() : getProdStylesConfig());

  if (options.dev) {
    config = webpackMerge({}, config, devPartial);
  } else if (webpackOptions.p) {
    config = webpackMerge({}, config, prodPartial);
  }

  if (options.serve) {
    return portfinder.getPortPromise().then(port => {
      config.devServer.port = port;
      return config;
    });
  } else {
    return Promise.resolve(config);
  }
};
