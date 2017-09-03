import { expect } from 'chai';
import { Config, parseConfig, CacheType, CommandType } from '../../src/api/config';

let config: Config;

let data = {
  language: null,
  cache: null,
  branches: null,
  env: null
};

describe('Common Configuration Options', () => {

  describe('Language property', () => {
    beforeEach(() => data.language = 'node_js');

    it(`should parse language from configuration file`, () => {
      const parsed = parseConfig(data);
      expect(parsed.language).to.equal('node_js');
    });

    it(`should throw an error if unknown language is specified`, () => {
      data.language = 'xmatrix';
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should not throw an error if null is specified`, () => {
      data.language = null;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should not throw an error if language property doesn't exists`, () => {
      delete data.language;
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should set language to null if language property doesn't exists`, () => {
      delete data.language;
      expect(parseConfig(data).language).to.be.equal(null);
    });

    it(`should not throw an error if empty string is specified`, () => {
      data.language = '';
      expect(() => parseConfig(data)).to.not.throw(Error);
    });

    it(`should set language to null if empty string is specified`, () => {
      data.language = '';
      expect(parseConfig(data).language).to.be.equal(null);
    });
  });

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

    it(`should be enum specified in CacheType if only string is specified`, () => {
      Object.keys(CacheType).forEach(cacheType => {
        data.cache = cacheType;
        expect(() => parseConfig(data)).to.not.throw(Error);
      });
    });

    it(`should return array of single appropriate dir if 'bundler' is specified`, () => {
      data.cache = 'bundler';
      const parsed = parseConfig(data);
      const expected = [ { bundler: 'vendor/bundle' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'yarn' is specified`, () => {
      data.cache = 'yarn';
      const parsed = parseConfig(data);
      const expected = [ { yarn: '$HOME/.cache/yarn' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'pip' is specified`, () => {
      data.cache = 'pip';
      const parsed = parseConfig(data);
      const expected = [ { pip: '$HOME/.cache/pip' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'packages' is specified`, () => {
      data.cache = 'packages';
      const parsed = parseConfig(data);
      const expected = [ { packages: '$HOME/R/Library' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should return array of single appropriate dir if 'cargo' is specified`, () => {
      data.cache = 'cargo';
      const parsed = parseConfig(data);
      const expected = [ { cargo: '$HOME/.cargo' } ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should throw an error if specified string is not enum of CacheType`, () => {
      data.cache = 'xmatrix';
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should return appropriate array of directories if directories array is specified`, () => {
      data.cache = { directories: ['node_modules', 'vendor/packages'] };
      const parsed = parseConfig(data);
      const expected = [
        { dir: 'node_modules' },
        { dir: 'vendor/packages' }
      ];
      expect(parsed.cache).to.deep.equal(expected);
    });

    it(`should throw an error when directories property is not an array`, () => {
      data.cache = { directories: null };
      expect(() => parseConfig(data)).to.throw(Error);
    });

    it(`should throw an error when directories property is not defined`, () => {
      data.cache = {};
      expect(() => parseConfig(data)).to.throw(Error);
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
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
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
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
        ],
        exclude: [],
        allow_failures: []
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });

    it(`should parse data properly when matrix is defined as array in include`, () => {
      data = Object.assign(data, { matrix: {
        include: [
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
        ],
        exclude: [],
        allow_failures: []
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
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
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
        ],
        allow_failures: []
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [],
        exclude: [
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
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
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
        ]
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [],
        exclude: [],
        allow_failures: [
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
        ]
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });

    it(`should parse data properly when matrix is defined in all properties`, () => {
      data = Object.assign(data, { matrix: {
        include: [
          { node_js: '7', env: 'SCRIPT=lint' }
        ],
        exclude: [
          { node_js: '6', env: 'SCRIPT=test:protractor' }
        ],
        allow_failures: [
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
        ]
      }});
      const parsed = parseConfig(data);
      const expected = {
        include: [
          { node_js: '7', env: 'SCRIPT=lint' }
        ],
        exclude: [
          { node_js: '6', env: 'SCRIPT=test:protractor' }
        ],
        allow_failures: [
          { node_js: '8', env: 'SCRIPT=lint' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_e2e.js' },
          { node_js: '8', env: 'SCRIPT=test:protractor' },
          { node_js: '8', env: 'NODE_SCRIPT=./tests/run_unit.js' }
        ]
      };

      expect(parsed.matrix).to.deep.equal(expected);
    });
  });

});
