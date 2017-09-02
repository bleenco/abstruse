import { expect } from 'chai';
import { readConfig } from '../helpers/utils';
import { Config, generateCommandsAndEnv, parseConfig, Repository } from '../../src/api/config';

let repo: Repository = { url: 'https://github.com/jruby/jruby.git' };
let config: Config;

describe('Commands generation', () => {
  beforeEach(() => {
    return readConfig('jruby.yml').then(cfg => config = parseConfig(cfg));
  });

  it(`should not throw an error when generating 'jruby.yml' example`, () => {
    expect(() => generateCommandsAndEnv(repo, config)).to.not.throw(Error);
  });

  it(`should parse 'jruby.yml' example with result of 10 jobs`, () => {
    const cmds = generateCommandsAndEnv(repo, config);
    expect(cmds.length).to.equal(10);
  });
});
