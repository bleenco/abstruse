import * as express from 'express';
import * as docker from './docker';
import * as system from './system';
import * as utils from './utils';
import { resolve } from 'path';
import { Observable } from 'rxjs';
import { exists } from './fs';
import { getFilePath } from './utils';
import { reinitializeDatabase } from './db/migrations';
import { usersExists, createUser } from './db/user';

export function webRoutes(): express.Router {
  const router = express.Router();

  router.use('/css', express.static(resolve(__dirname, '../app/css'), { index: false }));
  router.use('/js', express.static(resolve(__dirname, '../app/js'), { index: false }));
  router.use('/images', express.static(resolve(__dirname, '../app/images'), { index: false }));
  router.use('/css/fonts', express.static(resolve(__dirname, '../app/fonts'), { index: false }));

  router.get('/setup', index);
  router.get('/login', index);
  router.all('/*', index);

  return router;
}

export function userRoutes(): express.Router {
  const router = express.Router();

  router.post('/create', (req: express.Request, res: express.Response) => {
    createUser(req.body).then(() => {
      return res.status(200).json({ status: true });
    }).catch(err => {
      return res.status(200).json({ status: false });
    });
  });

  return router;
}

export function setupRoutes(): express.Router {
  const router = express.Router();

  router.get('/ready', (req: express.Request, res: express.Response) => {
    Observable.merge(...[
      system.isSQLiteInstalled(),
      docker.isDockerInstalled(),
      docker.isDockerRunning(),
      docker.imageExists('abstruse'),
      Observable.fromPromise(exists(getFilePath('config.json'))),
      Observable.fromPromise(exists(getFilePath('abstruse.sqlite'))),
      Observable.fromPromise(usersExists())
    ])
    .toArray()
    .subscribe(data => {
      const isFalse = data.findIndex(x => !x);
      if (isFalse === -1) {
        res.status(200).json({ data: true });
      } else {
        res.status(200).json({ data: false });
      }
    });
  });

  router.get('/db', (req: express.Request, res: express.Response) => {
    Observable.merge(...[
      Observable.fromPromise(exists(getFilePath('abstruse.sqlite'))),
      Observable.fromPromise(usersExists())
    ])
    .toArray()
    .subscribe(data => {
      return res.status(200).json({ data: data.findIndex(x => !x) === -1 });
    });
  });

  router.get('/status', (req: express.Request, res: express.Response) => {
    system.isSQLiteInstalled().subscribe(sqlite => {
      docker.isDockerInstalled().subscribe(dockerInstalled => {
        if (dockerInstalled) {
          docker.isDockerRunning().subscribe(dockerRunning => {
            const data = { sqlite: sqlite, docker: dockerInstalled, dockerRunning: dockerRunning };
            res.status(200).json({ data: data });
          });
        } else {
          const data = { sqlite: sqlite, docker: false, dockerRunning: false };
          res.status(200).json({ data: data });
        }
      });
    });
  });

  router.post('/db/init', (req: express.Request, res: express.Response) => {
    reinitializeDatabase().then(() => {
      return res.status(200).json({ data: true });
    });
  });

  return router;
}

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(resolve(__dirname, '../app/index.html'));
}
