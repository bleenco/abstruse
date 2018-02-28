exports.config = {
  allScriptsTimeout: 300000,
  specs: [
    './e2e/**/*.e2e.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--disable-gpu', '--window-size=1024,768']
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
  useAllAngular2AppRoots: true,
  beforeLaunch() {
    require('ts-node').register({
      project: 'e2e/tsconfig.json'
    });
  }
};
