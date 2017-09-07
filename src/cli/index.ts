import * as minimist from 'minimist';
import { red, green, yellow } from 'chalk';
import { encrypt, decrypt } from './encrypt';

const argv = minimist(process.argv.slice(2));

if (argv.encrypt) {
  if (argv.server) {
    encrypt(argv.encrypt, argv.server)
      .then(result => {
        if (result) {
          console.log(green(result));
        } else {
          console.log(red('Error: retreiving public key from server failed!'));
        }
      }).catch(err => console.log(red(err)));
  } else {
    console.log(red('Server paramter is missing'));
  }
}

if (argv.decrypt) {
  if (argv.privatekey) {
    decrypt(argv.decrypt,  argv.privatekey)
      .then(result => {
        if (result) {
          console.log(green(result));
        }
      }).catch(err => console.log(red(err)));
  } else {
    console.log(red('Error: private key missing'));
  }
}

if (argv.checkConfig) {
  console.log(yellow(argv.checkConfig));
  console.log(yellow('not implemented yet'));
}
