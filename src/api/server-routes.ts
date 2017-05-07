import * as express from 'express';
import * as docker from './docker';

export function setupRoutes(): express.Router {
  const router = express.Router();

  router.get('/docker-status', (req: express.Request, res: express.Response) => {
    docker.isDockerInstalled().subscribe(installed => {
      if (installed) {
        docker.isDockerRunning().subscribe(running => {
          res.status(200).json({ data: { installed: installed, running: running }});
        });
      } else {
        res.status(200).json({ data: { installed: installed, running: false } });
      }
    });
  });

  return router;
}
