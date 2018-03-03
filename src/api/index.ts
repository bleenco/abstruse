import * as minimist from 'minimist';

const setup = require('./setup');
const os = require('os');
const path = require('path');
const argv = minimist(process.argv.slice(2), {
  string: ['dir']
});

setup.setHome(argv.dir ? path.resolve(process.cwd(), argv.dir) : os.homedir());

import { ExpressServer } from './server';
import { SocketServer } from './socket';
import { Observable } from 'rxjs';
import { logger, LogMessageType } from './logger';
import { getAbstruseVersion } from './utils';
import { initSetup } from './setup';
import { generateKeys } from './security';
import * as db from './db/migrations';
import chalk from 'chalk';

const server = new ExpressServer({ port: 6500 });

initSetup()
  .then(() => db.create())
  .then(() => {
    const version = getAbstruseVersion();
    const msg: LogMessageType = {
      message: `[server]: starting Abstruse CI version ${chalk.green(version)} ...`,
      type: 'info',
      notify: false
    };
    logger.next(msg);
  })
  .then(() =>
    server.start().subscribe(app => {
      const socket = new SocketServer({ app: app });
      Observable
        .merge(...[socket.start(), generateKeys()])
        .subscribe(data => {
          const msg: LogMessageType = { message: data, type: 'info', notify: false };
          logger.next(msg);
        }, err => {
          const msg: LogMessageType = { message: err, type: 'error', notify: false };
          logger.next(msg);
        });
    }));
