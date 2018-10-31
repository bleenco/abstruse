import { expect } from 'chai';

import { Config, generateJobsAndEnv, JobStage, parseConfig, Repository } from '../../src/api/config';
import { readConfig } from '../helpers/utils';

let repo: Repository = {
  clone_url: 'https://github.com/bleenco/abstruse.git',
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

    it(`should parse example with result of 4 jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      expect(cmds.length).to.equal(4);
    });

    it(`should parse example with result of 3 test jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.test);
      expect(cmds.length).to.equal(3);
    });

    it(`should parse example with result of none deploy jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.deploy);
      expect(cmds.length).to.equal(1);
    });
  });

  describe(`'example_nodejs_default.yml'`, () => {
    beforeEach(() => {
      return readConfig('example_nodejs_default.yml').then(cfg => config = parseConfig(cfg));
    });

    it(`should not throw an error on parse`, () => {
      expect(() => generateJobsAndEnv(repo, config)).to.not.throw(Error);
    });

    it(`should auto-generate deps and test commands for each job`, () => {
      repo.file_tree = ['package.json'];
      const cmds = generateJobsAndEnv(repo, config);
      const deps = 'npm install';
      const script = 'npm test';

      cmds.forEach(cmd => {
        expect(cmd.commands.findIndex(c => c.command === deps) !== -1).to.equal(true);
        expect(cmd.commands.findIndex(c => c.command === script) !== -1).to.equal(true);
      });
    });

    it(`should auto-generate deps and test commands for each job (yarn)`, () => {
      repo.file_tree = ['package.json', 'yarn.lock'];
      const cmds = generateJobsAndEnv(repo, config);
      const deps = 'yarn';
      const script = 'yarn test';

      cmds.forEach(cmd => {
        expect(cmd.commands.findIndex(c => c.command === deps) !== -1).to.equal(true);
        expect(cmd.commands.findIndex(c => c.command === script) !== -1).to.equal(true);
      });
    });
  });

});
