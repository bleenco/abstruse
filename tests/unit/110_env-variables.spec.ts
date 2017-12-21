import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { delay } from '../helpers/utils';
import * as fs from 'fs-extra';
import * as env from '../../src/api/env-variables';

chai.use(chaiAsPromised);
const expect = chai.expect;
let tempRoot = null;

describe('Environment Variables', () => {
  it(`init env variables`, () => {
    let vars = env.init();

    expect(Object.keys(vars).length).to.equals(12);
  });

  it(`init env variables and set ABSTRUSE_BRANCH`, () => {
    let vars = env.init();
    env.set(vars, 'ABSTRUSE_BRANCH', 'test');

    expect(Object.keys(vars).length).to.equals(12);
    expect(vars.ABSTRUSE_BRANCH).to.deep.equals({ value: 'test', secure: false });
  });

  it(`init env variables and set and unset ABSTRUSE_BRANCH`, () => {
    let vars = env.init();
    env.set(vars, 'ABSTRUSE_BRANCH', 'test');
    env.unset(vars, 'ABSTRUSE_BRANCH');

    expect(Object.keys(vars).length).to.equals(11);
  });

  it(`init env variables, set ABSTRUSE_BRANCH and serialize variables`, () => {
    let vars = env.init();
    env.set(vars, 'ABSTRUSE_BRANCH', 'test');
    const serialized = env.serialize(vars);

    expect(serialized.length).to.equals(12);
    expect(serialized[0]).to.equals('ABSTRUSE_BRANCH=test');
    expect(serialized[1]).to.equals('ABSTRUSE_BUILD_DIR=null');
  });

  it(`init env variables, set ABSTRUSE_BRANCH, serialize variables and then deserialize`, () => {
    let vars = env.init();
    env.set(vars, 'ABSTRUSE_BRANCH', 'test');
    const serialized = env.serialize(vars);
    const deserialized = env.unserialize(serialized);

    expect(Object.keys(vars).length).to.equals(12);
    expect(deserialized.ABSTRUSE_BRANCH).to.deep.equals({ value: 'test', secure: false });
  });
});
