import { expect } from 'chai';
import { readConfig } from '../helpers/utils';
import { Config } from '../../src/api/config';

let config: Config;

describe('Android Configurations', () => {
  beforeEach(() => {
    return readConfig('android.yml').then(cfg => config = cfg);
  });

  it('config', () => {
    console.log(config);
  });
});
