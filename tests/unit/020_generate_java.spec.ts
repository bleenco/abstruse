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
  url: 'https://github.com/jruby/jruby.git',
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

    it(`should detect it is about 'java' language`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      cmds.forEach(cmd => expect(cmd.language).to.equal('java'));
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

    it(`should display correct UI display_env variables`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      const expected = []
        .concat(config.env.matrix)
        .concat(config.matrix.include.map(job => job.env));

      cmds.forEach((cmd, i) => {
        expect(cmd.display_env).to.equal(expected[i]);
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

    it(`should detect it is about 'java' language`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      cmds.forEach(cmd => expect(cmd.language).to.equal('java'));
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

    it(`should parse example with result of single job`, () => {
      const cmds = generateJobsAndEnv(repo, config);
      expect(cmds.length).to.equal(1);
    });

    it(`should parse example with result of single test job`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.test);
      expect(cmds.length).to.equal(1);
    });

    it(`should parse example with result of none deploy jobs`, () => {
      const cmds = generateJobsAndEnv(repo, config)
        .filter(cmd => cmd.stage === JobStage.deploy);
      expect(cmds.length).to.equal(0);
    });
  });

  describe('default auto-generated Java commands', () => {
    beforeEach(() => {
      return readConfig('example_java_riak.yml')
        .then(cfg => config = parseConfig(cfg));
    });

    it(`should auto-generate install command (mvnw)`, () => {
      repo.file_tree = ['pom.xml', 'mvnw'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = './mvnw install -DskipTests=true -Dmaven.javadoc.skip=true -B -V';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate install command (mvn)`, () => {
      repo.file_tree = ['pom.xml'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'mvn install -DskipTests=true -Dmaven.javadoc.skip=true -B -V';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate script command (mvnw)`, () => {
      config.script = null;
      repo.file_tree = ['pom.xml', 'mvnw'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = './mvnw test -B';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate script command (mvn)`, () => {
      config.script = null;
      repo.file_tree = ['pom.xml'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'mvn test -B';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate install command (gradle)`, () => {
      config.script = null;
      repo.file_tree = ['build.gradle'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = 'gradle assemble';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });

    it(`should auto-generate install command (gradlew)`, () => {
      config.script = null;
      repo.file_tree = ['build.gradle', 'gradlew'];
      const cmds = generateJobsAndEnv(repo, config);
      const expected = './gradlew assemble';
      const index = cmds[0].commands.findIndex(cmd => cmd.command === expected);
      expect(index).to.not.equal(-1);
    });
  });

});
