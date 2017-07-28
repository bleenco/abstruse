#!/usr/bin/env node

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
import * as logger from './logger';
import { initSetup } from './utils';
import { reinitializeDatabase } from './db/migrations';

const server = new ExpressServer({ port: 6500 });
const socket = new SocketServer({ port: 6501 });

Observable
  .merge(...[
      Observable.fromPromise(initSetup()),
      server.start(),
      socket.start()
    ]
  )
  .concat(Observable.fromPromise(reinitializeDatabase()))
  .subscribe(data => {
    if (data) {
      logger.info(data);
    }
  }, err => {
    logger.error(err);
  }, () => {
    logger.info('done.');
  });
