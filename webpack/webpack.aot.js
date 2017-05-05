const { root } = require('./helpers');
const { AotPlugin } = require('@ngtools/webpack');

function getAotPlugin(aot) {
  return new AotPlugin({
    tsConfigPath: root('./src/app/tsconfig.json'),
    skipCodeGeneration: !aot
  });
}

module.exports = {
  getAotPlugin: getAotPlugin
};
