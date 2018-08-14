import * as express from 'express';
import * as system from '../system';
import * as docker from '../docker';
import { exists, readJsonFile } from '../fs';
import { getFilePath } from '../setup';
import { logger, LogMessageType } from '../logger';
import { usersExists } from '../db/user';
import { getConfigAsync, saveConfigAsync, checkSetupDone, finishSetup } from '../setup';
import { merge, from, empty, of, concat } from 'rxjs';
import { map, toArray, concatMap, concatAll } from 'rxjs/operators';

export const setupRouter = express.Router();

setupRouter.get('/ready', (req: express.Request, res: express.Response) => {
  return isSetupDone()
    .then(done => {
      res.status(200).json({ data: done ? 'ready' : 'setup' });
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      res.status(500).json({ data: err });
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

setupRouter.get('/config', (req: express.Request, res: express.Response) => {
  return isSetupDone()
    .then(done => {
      if (done) {
        return Promise.resolve({ error: 'auth error' });
      } else {
        return readJsonFile(getFilePath('config.json'));
      }
    })
    .then(data => {
      if (data && data.error) {
        res.status(403).json({ error: data.error });
      } else {
        res.status(200).json({
          data: {
            secret: data.secret,
            jwtSecret: data.jwtSecret,
            concurrency: data.concurrency,
            idleTimeout: data.idleTimeout,
            jobTimeout: data.jobTimeout
          }
        });
      }
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      res.status(500).json({ data: err });
    });
});

setupRouter.post('/config', (req: express.Request, res: express.Response) => {
  return isSetupDone()
    .then(done => {
      if (done) {
        return Promise.resolve({ error: 'auth error' });
      } else {
        return getConfigAsync();
      }
    })
    .then(data => {
      if (data && data.error) {
        return Promise.resolve(data);
      } else {
        const config = Object.assign({}, data, req.body);
        return saveConfigAsync(config);
      }
    })
    .then(data => {
      if (data && data.error) {
        res.status(403).json({ error: data.error });
      } else {
        res.status(200).json({ data: 'ok' });
      }
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      res.status(500).json({ data: err });
    });
});

setupRouter.post('/done', (req: express.Request, res: express.Response) => {
  return isSetupDone()
    .then(done => {
      if (!done) {
        return finishSetup();
      } else {
        return Promise.reject('setup already done');
      }
    })
    .then(() => res.status(200).json({ data: 'ok' }))
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      res.status(500).json({ data: err });
    });
});

function isSetupDone(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let done: boolean;
    const sub = merge(...[
      system.isGitInstalled(),
      system.isSQLiteInstalled(),
      docker.isDockerInstalled(),
      docker.isDockerRunning(),
      from(exists(getFilePath('config.json'))),
      from(exists(getFilePath('abstruse.sqlite'))),
      from(usersExists()),
      from(checkSetupDone())
    ])
      .pipe(toArray())
      .subscribe(data => {
        const isFalse = data.findIndex(x => !x);
        done = isFalse === -1;
      }, err => {
        sub.unsubscribe();
        reject(err);
      }, () => {
        sub.unsubscribe();
        resolve(done);
      });
  });
}
