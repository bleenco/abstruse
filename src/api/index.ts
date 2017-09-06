const minimist = require('minimist');
const utils = require('./utils');
const os = require('os');
const path = require('path');
const argv = minimist(process.argv.slice(2), {
  string: ['dir']
});

utils.setHome(argv.dir ? path.resolve(process.cwd(), argv.dir) : os.homedir());

import { ExpressServer } from './server';
import { SocketServer } from './socket';
import { Observable } from 'rxjs';
import { logger, LogMessageType } from './logger';
import { initSetup } from './utils';
import * as db from './db/migrations';

const server = new ExpressServer({ port: 6500 });
const socket = new SocketServer({ port: 6501 });

initSetup()
  .then(() => db.create())
  .then(() => {
    Observable.merge(...[server.start(), socket.start()])
      .subscribe(data => {
        const msg: LogMessageType = { message: data, type: 'info', notify: false };
        logger.next(msg);
      }, err => {
        const msg: LogMessageType = { message: err, type: 'error', notify: false };
        logger.next(msg);
      });
  });
