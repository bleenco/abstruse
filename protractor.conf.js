const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 300000,
  specs: [
    './e2e/**/*.e2e.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--no-sandbox']
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:6500/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000,
    print: function() {}
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e'
    });
  },
  onPrepare() {
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};
