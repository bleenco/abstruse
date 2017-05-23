#!/usr/bin/env node

import { ExpressServer } from './server';
import { SocketServer } from './socket';
import { Observable } from 'rxjs';
import * as logger from './logger';
import * as utils from './utils';

const server = new ExpressServer({ port: 6500 });
const socket = new SocketServer({ port: 6501 });

Observable
  .merge(...[
    Observable.fromPromise(utils.initSetup()),
    server.start(),
    socket.start()
  ])
  .subscribe(data => {
    if (data) {
      logger.info(data);
    }
  }, err => {
    logger.error(err);
  }, () => {
    logger.info('done.');
  });
