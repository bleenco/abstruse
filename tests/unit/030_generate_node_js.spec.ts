import { expect } from 'chai';
import { readConfig } from '../helpers/utils';
import {
  Config,
  generateJobsAndEnv,
  parseConfig,
  Repository,
  JobStage
} from '../../src/api/config';

let repo: Repository = {
  url: 'https://github.com/bleenco/abstruse.git',
  branch: 'master',
  file_tree: []
};
let config: Config;

describe('Generate (Node.JS)', () => {

  describe(`'example_nodejs_abstruse.yml'`, () => {
    beforeEach(() => {
      return readConfig('example_nodejs_abstruse.yml').then(cfg => config = parseConfig(cfg));
    });

    it(`should not throw an error on parse`, () => {
      expect(() => generateJobsAndEnv(repo, config)).to.not.throw(Error);
    });

    it(`should detect it is about 'node_js' language`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      cmds.forEach(cmd => expect(cmd.language).to.equal('node_js'));
    });

    it(`should parse example with result of 3 jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      expect(cmds.length).to.equal(3);
    });

    it(`should parse example with result of 3 test jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.test);
      expect(cmds.length).to.equal(3);
    });

    it(`should parse example with result of none deploy jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.deploy);
      expect(cmds.length).to.equal(0);
    });

    it(`should auto-generate default dependency script if not specified`, () => {
      config.install = [];
      repo.file_tree = ['package.json'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'npm install';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate default script command when no script is specified`, () => {
      config.script = [];
      repo.file_tree = ['package.json'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'npm test';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate default dependency script if not specified (yarn)`, () => {
      config.install = [];
      repo.file_tree = ['package.json', 'yarn.lock'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'yarn';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate default script command when no script is specified (yarn)`, () => {
      config.script = [];
      repo.file_tree = ['package.json', 'yarn.lock'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'yarn test';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-switch to 'npm test' when using yarn with NodeJS version < 4`, () => {
      config.script = [];
      repo.file_tree = ['package.json', 'yarn.lock'];
      config.matrix.include = config.matrix.include.map(i => {
        i.node_js = '0.12';
        return i;
      });
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'npm test';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-switch to 'npm install' when using yarn with NodeJS version < 4`, () => {
      config.install = [];
      repo.file_tree = ['package.json', 'yarn.lock'];
      config.matrix.include = config.matrix.include.map(i => {
        i.node_js = '0.12';
        return i;
      });
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'npm install';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });
  });

  describe(`'example_nodejs_default.yml'`, () => {
    beforeEach(() => {
      return readConfig('example_nodejs_default.yml').then(cfg => config = parseConfig(cfg));
    });

    it(`should not throw an error on parse`, () => {
      expect(() => generateJobsAndEnv(repo, config)).to.not.throw(Error);
    });

    it(`should detect it is about 'node_js' language`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      cmds.forEach(cmd => expect(cmd.language).to.equal('node_js'));
    });

    it(`should parse example with result of 2 jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      expect(cmds.length).to.equal(2);
    });
  });

});
