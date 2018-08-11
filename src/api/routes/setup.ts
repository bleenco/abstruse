import * as express from 'express';
import * as system from '../system';
import * as docker from '../docker';
import { exists } from '../fs';
import { getFilePath } from '../setup';
import { logger, LogMessageType } from '../logger';
import { usersExists } from '../db/user';
import { merge, from, empty, of, concat } from 'rxjs';
import { map, toArray, concatMap, concatAll } from 'rxjs/operators';

export const setupRouter = express.Router();

setupRouter.get('/ready', (req: express.Request, res: express.Response) => {
  const sub = merge(...[
    system.isGitInstalled(),
    system.isSQLiteInstalled(),
    docker.isDockerInstalled(),
    docker.isDockerRunning(),
    from(exists(getFilePath('config.json'))),
    from(exists(getFilePath('abstruse.sqlite'))),
    from(usersExists())
  ])
    .pipe(toArray())
    .subscribe(data => {
      const isFalse = data.findIndex(x => !x);
      res.status(200).json({ data: isFalse === -1 ? 'ready' : 'setup' });
    }, err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      res.status(500).json({ data: err });
    }, () => {
      sub.unsubscribe();
    });
});

setupRouter.get('/status', (req: express.Request, res: express.Response) => {
  const sub =
    concat(...[
      system.isGitInstalled(),
      system.isSQLiteInstalled(),
      docker.isDockerInstalled(),
      docker.isDockerRunning()
    ])
      .pipe(
        toArray(),
        concatMap(status => {
          const version = concat(...[
            status[0] ? of(system.getGitVersion()) : empty(),
            status[1] ? of(system.getSQLiteVersion()) : empty(),
            status[2] && status[3] ? of(docker.getDockerVersion()) : empty()
          ]).pipe(concatAll(), toArray());
          return concat(...[of(status), version]);
        }),
        toArray(),
        map(resp => {
          return {
            git: { status: resp[0][0], version: resp[1][0] },
            sqlite: { status: resp[0][1], version: resp[1][1] },
            docker: { status: resp[0][2], version: resp[1][2] },
            dockerRunning: { status: resp[0][3] }
          };
        })
      )
      .subscribe(data => {
        res.status(200).json({ data });
      }, err => {
        const logMessage: LogMessageType = {
          type: 'error', message: err, notify: false
        };
        logger.next(logMessage);
        res.status(500).json({ data: err });
      }, () => {
        sub.unsubscribe();
      });
});
