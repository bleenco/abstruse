import * as minimist from 'minimist';

let setup = require('./setup');
let os = require('os');
let path = require('path');
let argv = minimist(process.argv.slice(2), {
  string: ['dir']
});

setup.setHome(argv.dir ? path.resolve(process.cwd(), argv.dir) : os.homedir());

import { ExpressServer } from './server';
import { SocketServer } from './socket';
import { merge } from 'rxjs';
import { logger, LogMessageType } from './logger';
import { getAbstruseVersion } from './utils';
import { initSetup } from './setup';
import { generateKeys } from './security';
import * as db from './db/migrations';
import chalk from 'chalk';

let server = new ExpressServer({ port: 6500 });

initSetup()
  .then(() => db.create())
  .then(() => {
    let version = getAbstruseVersion();
    let msg: LogMessageType = {
      message: `[server]: starting Abstruse CI version ${chalk.green(version)} ...`,
      type: 'info',
      notify: false
    };
    logger.next(msg);
  })
  .then(() =>
    server.start().subscribe(app => {
      let socket = new SocketServer({ app: app });
      merge(...[socket.start(), generateKeys()])
        .subscribe(data => {
          let msg: LogMessageType = { message: data, type: 'info', notify: false };
          logger.next(msg);
        }, err => {
          let msg: LogMessageType = { message: err, type: 'error', notify: false };
          logger.next(msg);
        });
    }));
