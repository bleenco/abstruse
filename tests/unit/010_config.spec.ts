import { expect } from 'chai';
import { Config, parseConfig, CommandType } from '../../src/api/config';

let config: Config;

let data = {
  language: null,
  cache: null,
  branches: null,
  env: null
};

describe('Common Configuration Options', () => {

  describe('OS property', () => {
    it(`should be linux if property is not set`, () => {
      const parsed = parseConfig(data);
      expect(parsed.os).to.be.equal('linux');
    });

    it(`should be linux if property is null`, () => {
      data = Object.assign(data, { os: null });
      const parsed = parseConfig(data);
      expect(parsed.os).to.be.equal('linux');
    });

    it(`should be linux if property is whatever else`, () => {
      data = Object.assign(data, { os: 'macos' });
      const parsed = parseConfig(data);
      expect(parsed.os).to.be.equal('linux');
    });
  });

  describe('Cache property', () => {
    beforeEach(() => data.cache = 'node_modules');

    it(`should not throw if property is not set`, () => {
      delete data.cache;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should be null if property is not set`, () => {
      delete data.cache;
      const parsed = parseConfig(data);
      expect(parsed.cache).to.equal(null);
    });
  });

  describe('Branches property', () => {
    beforeEach(() => {
      data = { language: null, cache: null, branches: null, env: null };
    });

    it(`should not throw if property is null`, () => {
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw if property is empty string`, () => {
      data.branches = '';
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should throw if property is string`, () => {
      data.branches = 'master';
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should not throw if property is array of branches`, () => {
      data.branches = ['master', 'dev'];
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should parse appropriate object when branches is defined as array`, () => {
      data.branches = ['master', 'dev'];
      const parsed = parseConfig(data);
      const expected = {
        test: ['master', 'dev'],
        ignore: []
      };
      expect(parsed.branches).to.deep.equal(expected);
    });

    it(`should not throw error when only and except are defined with empty arrays`, () => {
      data.branches = { only: [], except: [] };
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should parse appropriate object when only and except are defined with empty arrays`, () => {
      data.branches = { only: [], except: [] };
      const parsed = parseConfig(data);
      const expected = {
        test: [],
        ignore: []
      };
      expect(parsed.branches).to.deep.equal(expected);
    });

    it(`should parse appropriate object when only and except are defined with data`, () => {
      data.branches = { only: ['master'], except: ['dev'] };
      const parsed = parseConfig(data);
      const expected = {
        test: ['master'],
        ignore: ['dev']
      };
      expect(parsed.branches).to.deep.equal(expected);
    });
  });

  describe(`Env property`, () => {
    beforeEach(() => {
      data = { language: null, cache: null, branches: null, env: null };
    });

    it(`should now throw an error if env is not specified`, () => {
      delete data.env;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should now throw an error if env is null`, () => {
      data.env = null;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error if env is empty string`, () => {
      data.env = '';
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error if env is string`, () => {
      data.env = 'FOO=bar';
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should throw an error if env.global is string`, () => {
      data.env = { global: 'FOO=bar' };
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should not throw an error if env.global is null`, () => {
      data.env = { global: null };
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should throw an error if env.matrix is string`, () => {
      data.env = { matrix: 'FOO=bar' };
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should not throw an error if env.matrix is null`, () => {
      data.env = { matrix: null };
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should return appropriate values when env is string`, () => {
      data.env = 'FOO=bar';
      const parse = parseConfig(data);
      expect(parse.env.global).to.include(data.env);
    });

    it(`should return appropriate values when data is specified`, () => {
      data.env = {
        global: ['FOO=bar'],
        matrix: ['DB=production', 'DB=testing']
      };
      const parsed = parseConfig(data);
      expect(parsed.env).to.deep.equal(data.env);
    });
  });

  describe(`Commands properties`, () => {
    beforeEach(() => {
      data = { language: null, cache: null, branches: null, env: null };
      data = Object.assign(data, { script: 'npm install' });
    });

    it(`should not throw an error when command is specified as string`, () => {
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error when command is null`, () => {
      data = Object.assign(data, { script: null });
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error when command is empty string`, () => {
      data = Object.assign(data, { script: '' });
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error when command is array of strings`, () => {
      data = Object.assign(data, { script: ['npm install', 'npm rebuild'] });
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should parse commands appropriately when command is specified as string`, () => {
      data = Object.assign(data, { script: 'npm install' });
      const parsed = parseConfig(data);
      const expected = [{ command: 'npm install', type: CommandType.script }];
      expect(parsed.script).to.deep.equal(expected);
    });

    it(`should parse commands appropriately when command is specified as array of strings`, () => {
      data = Object.assign(data, { script: ['npm install', 'npm rebuild'] });
      const parsed = parseConfig(data);
      const expected = [
        { command: 'npm install', type: CommandType.script },
        { command: 'npm rebuild', type: CommandType.script }
      ];
      expect(parsed.script).to.deep.equal(expected);
    });
  });

  describe(`Build Matrix`, () => {
    beforeEach(() => {
      data = { language: null, cache: null, branches: null, env: null };
      data = Object.assign(data, {
        matrix: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ]
      });
    });

    it(`should not throw an error when matrix is null`, () => {
      data = Object.assign(data, { matrix: null });
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error when matrix is empty string`, () => {
      data = Object.assign(data, { matrix: '' });
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should throw an error when matrix is defined as string`, () => {
      data = Object.assign(data, { matrix: 'build' });
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should not throw an error when matrix is defined as array`, () => {
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should parse data properly when matrix is defined as array`, () => {
      const parsed = parseConfig(data);
      const expected = {
        include: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ],
        exclude: [],
        allow_failures: []
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });

    it(`should parse data properly when matrix is defined as array in include`, () => {
      data = Object.assign(data, { matrix: {
        include: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ],
        exclude: [],
        allow_failures: []
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ],
        exclude: [],
        allow_failures: []
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });

    it(`should parse data properly when matrix is defined as array in exclude`, () => {
      data = Object.assign(data, { matrix: {
        include: [],
        exclude: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ],
        allow_failures: []
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [],
        exclude: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ],
        allow_failures: []
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });

    it(`should parse data properly when matrix is defined as array in allow_failures`, () => {
      data = Object.assign(data, { matrix: {
        include: [],
        exclude: [],
        allow_failures: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ]
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [],
        exclude: [],
        allow_failures: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ]
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });

    it(`should parse data properly when matrix is defined in all properties`, () => {
      data = Object.assign(data, { matrix: {
        include: [
          { env: 'SCRIPT=lint node_js=7' }
        ],
        exclude: [
          {env: 'SCRIPT=test:protractor node_js=6' }
        ],
        allow_failures: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ]
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [
          { env: 'SCRIPT=lint node_js=7' }
        ],
        exclude: [
          { env: 'SCRIPT=test:protractor node_js=6' }
        ],
        allow_failures: [
          { env: 'SCRIPT=lint node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_e2e.js node_js=8' },
          { env: 'SCRIPT=test:protractor node_js=8' },
          { env: 'NODE_SCRIPT=./tests/run_unit.js node_js=8' }
        ]
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });
  });

});
