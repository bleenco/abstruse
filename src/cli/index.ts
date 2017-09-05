const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

import { encrypt } from './encrypt';

if (argv.encryptVariable) {
  encrypt(argv.encryptVariable);
  console.log('not implemented yet');
}

if (argv.checkConfig) {
  console.log(argv.checkConfig);
  console.log('not implemented yet');
}
