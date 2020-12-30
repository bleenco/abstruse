const glob = require('glob');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');

module.exports = {
  plugins: [
    new PurgeCSSPlugin({ paths: glob.sync('./src/**/*.html', { nodir: true }) })
  ]
};
