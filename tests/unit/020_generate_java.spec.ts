import { expect } from 'chai';
import { readConfig } from '../helpers/utils';
import {
  Config,
  generateJobsAndEnv,
  parseConfig,
  Repository,
  JobStage
} from '../../src/api/config';

const repo: Repository = {
  clone_url: 'https://github.com/jruby/jruby.git',
  branch: 'master',
  file_tree: []
};
let config: Config;

describe('Generate (Java)', () => {

  describe(`'example_java_jruby.yml'`, () => {
    beforeEach(() => {
      return readConfig('example_java_jruby.yml').then(cfg => config = parseConfig(cfg));
    });

    it(`should not throw an error on parse`, () => {
      expect(() => generateJobsAndEnv(repo, config)).to.not.throw(Error);
    });

    it(`should parse example with result of 29 jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      expect(cmds.length).to.equal(29);
    });

    it(`should parse example with result of 29 test jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.test);
      expect(cmds.length).to.equal(29);
    });

    it(`should parse example with result of none deploy jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.deploy);
      expect(cmds.length).to.equal(0);
    });

    it(`should parse matrix with 3 env variables for each job`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      cmds.forEach(cmd => {
        expect(cmd.env.length).to.equal(3);
      });
    });
  });

  describe(`'example_java_cucumber_jvm.yml'`, () => {
    beforeEach(() => {
      return readConfig('example_java_cucumber_jvm.yml')
        .then(cfg => config = parseConfig(cfg));
    });

    it(`should not throw an error on parse`, () => {
      expect(() => generateJobsAndEnv(repo, config)).to.not.throw(Error);
    });

    it(`should parse example with result of 5 jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      expect(cmds.length).to.equal(5);
    });

    it(`should parse example with result of 4 test jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.test);
      expect(cmds.length).to.equal(4);
    });

    it(`should parse example with result of single deploy job`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.deploy);
      expect(cmds.length).to.equal(1);
    });
  });

  describe(`'example_java_riak.yml'`, () => {
    beforeEach(() => {
      return readConfig('example_java_riak.yml')
        .then(cfg => config = parseConfig(cfg));
    });

    it(`should not throw an error on parse`, () => {
      expect(() => generateJobsAndEnv(repo, config)).to.not.throw(Error);
    });

    it(`should detect it is about 'java' language`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      cmds.forEach(cmd => expect(cmd.language).to.equal('java'));
    });

    it(`should parse example with result of none deploy jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.deploy);
      expect(cmds.length).to.equal(0);
    });
  });
});
