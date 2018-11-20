import * as minimist from 'minimist';
import * as setup from './setup';
import * as os from 'os';
import * as path from 'path';
import { ExpressServer } from './server';
import { SocketServer } from './socket';
import { logger, LogMessageType } from './logger';
import { getAbstruseVersion } from './utils';
import { generateKeys } from './security';
import * as db from './db/migrations';
import chalk from 'chalk';
import { startScheduler } from './process-manager';

const argv = minimist(process.argv.slice(2), { string: ['dir'] });
setup.setHome(argv.dir ? path.resolve(argv.dir) : os.homedir());

const server = new ExpressServer({ port: 6500 });

setup.writeDefaultConfigAsync()
  .then(() => setup.initSetup())
  .then(() => db.create())
  .then(() => {
    const version = getAbstruseVersion();
    const msg: LogMessageType = {
      message: `[server]: starting Abstruse CI version ${chalk.green(version)}`,
      type: 'info',
      notify: false
    };
    logger.next(msg);
  })
  .then(() => server.start())
  .then(app => {
    const socketServer = new SocketServer({ app });
    socketServer.start();
  })
  .then(() => startScheduler())
  .then(() => generateKeys());
