import { expect } from 'chai';
import { readConfig } from '../helpers/utils';
import { Config } from '../../src/api/config';

let config: Config;

describe('Java Configuration', () => {
  beforeEach(() => {
    return readConfig('java.yml').then(cfg => config = cfg);
  });
});
