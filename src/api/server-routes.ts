import * as express from 'express';
import * as docker from './docker';
import * as system from './system';
import * as utils from './utils';

export function setupRoutes(): express.Router {
  const router = express.Router();

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

  router.get('/init', (req: express.Request, res: express.Response) => {
    utils.initSetup();
    docker.buildImage('abstruse').subscribe(data => {
      console.log(data);
    }, err => {
      console.error(err);
    }, () => {
      res.status(200).json({ data: true });
    });
  });

  return router;
}
