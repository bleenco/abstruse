import * as minimist from 'minimist';
import * as setup from './setup';
import * as os from 'os';
import * as path from 'path';
import { ExpressServer } from './server';
import { SocketServer } from './socket';
import { logger, LogMessageType } from './logger';
import { getAbstruseVersion } from './utils';
import { initSetup } from './setup';
import { generateKeys } from './security';
import * as db from './db/migrations';
import chalk from 'chalk';

const argv = minimist(process.argv.slice(2), { string: ['dir'] });
setup.setHome(argv.dir ? path.resolve(process.cwd(), argv.dir) : os.homedir());

const server = new ExpressServer({ port: 6500 });

initSetup()
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
  .then(() => generateKeys());
