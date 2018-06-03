exports.config = {
  allScriptsTimeout: 300000,
  specs: [
    './e2e/**/*.e2e.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: ['--headless', '--disable-gpu', '--window-size=1920,1080']
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:6500/',
  framework: 'mocha',
  mochaOpts: {
    reporter: 'spec',
    timeout: 60000,
    slow: 10000,
    colors: true,
    bail: true
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  }
};
