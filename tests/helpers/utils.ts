import { resolve } from 'path';
import { readFile } from '../../src/api/fs';
import { Config } from '../../src/api/config';
import * as yaml from 'yamljs';

export function readConfig(configName: string): Promise<Config> {
  return readFile(resolve(__dirname, `../unit/configs/${configName}`))
    .then(config => yaml.parse(config));
}
