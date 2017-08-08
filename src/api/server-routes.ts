import * as express from 'express';
import * as docker from './docker';
import * as system from './system';
import * as utils from './utils';
import { resolve } from 'path';
import { Observable } from 'rxjs';
import { exists } from './fs';
import { getFilePath } from './utils';
import { reinitializeDatabase } from './db/migrations';
import {
  usersExists,
  createUser,
  login,
  getUser,
  updateUser,
  updateUserPassword,
  getUsers
} from './db/user';
import { addRepository, getRepositories, getRepository, getRepositoryBadge } from './db/repository';
import { getBuilds, getBuild } from './db/build';
import { getJob } from './db/job';
import { imageExists } from './docker';

export function webRoutes(): express.Router {
  const router = express.Router();

  router.use('/css', express.static(resolve(__dirname, '../app/css'), { index: false }));
  router.use('/js', express.static(resolve(__dirname, '../app/js'), { index: false }));
  router.use('/images', express.static(resolve(__dirname, '../app/images'), { index: false }));
  router.use('/css/fonts', express.static(resolve(__dirname, '../app/fonts'), { index: false }));
  router.use('/avatars', express.static(getFilePath('avatars'), { index: false }));

  router.get('/setup', index);
  router.get('/login', index);
  router.all('/*', index);

  return router;
}

export function buildRoutes(): express.Router {
  const router = express.Router();

  router.get('/limit/:limit/offset/:offset', (req: express.Request, res: express.Response) => {
    getBuilds(req.params.limit, req.params.offset).then(builds => {
      return res.status(200).json({ data: builds });
    });
  });

  router.get('/:id', (req: express.Request, res: express.Response) => {
    getBuild(req.params.id).then(build => {
      return res.status(200).json({ data: build });
    });
  });

  return router;
}

export function jobRoutes(): express.Router {
  const router = express.Router();

  router.get('/:id', (req: express.Request, res: express.Response) => {
    getJob(req.params.id).then(job => {
      return res.status(200).json({ data: job });
    });
  });

  return router;
}

export function userRoutes(): express.Router {
  const router = express.Router();

  router.get('/', (req: express.Request, res: express.Response) => {
    getUsers().then(users => {
      return res.status(200).json({ data: users });
    }).catch(err => {
      return res.status(200).json({ err: err });
    });
  });

  router.post('/login', (req: express.Request, res: express.Response) => {
    login(req.body).then(credentials => {
      res.status(200).json({ data: credentials });
    });
  });

  router.post('/create', (req: express.Request, res: express.Response) => {
    createUser(req.body).then(() => {
      return res.status(200).json({ status: true });
    }).catch(err => {
      return res.status(200).json({ status: false });
    });
  });

  router.post('/save', (req: express.Request, res: express.Response) => {
    updateUser(req.body).then(() => {
      return res.status(200).json({ data: true });
    }).catch(err => {
      return res.status(200).json({ data: false });
    });
  });

  router.post('/update-password', (req: express.Request, res: express.Response) => {
    updateUserPassword(req.body).then(() => {
      return res.status(200).json({ data: true });
    }).catch(err => {
      return res.status(200).json({ data: false });
    });
  });

  router.get('/:id', (req: express.Request, res: express.Response) => {
    getUser(req.params.id)
      .then(user => res.status(200).json({ data: user }))
      .catch(err => res.status(400).json({ err: err }));
  });

  return router;
}

export function repositoryRoutes(): express.Router {
  const router = express.Router();

  router.get('/', (req: express.Request, res: express.Response) => {
    getRepositories(req.query.userId, req.query.keyword).then(repos => {
      return res.status(200).json({ data: repos });
    }).catch(err => res.status(200).json({ status: false }));
  });

  router.get('/:id', (req: express.Request, res: express.Response) => {
    getRepository(req.params.id).then(repo => {
      return res.status(200).json({ data: repo });
    }).catch(err => res.status(200).json({ status: false }));
  });

  router.post('/add', (req: express.Request, res: express.Response) => {
    addRepository(req.body).then(result => {
      return res.status(200).json({ status: true });
    }).catch(err => res.status(200).json({ status: false }));
  });

  return router;
}

export function badgeRoutes(): express.Router {
  const router = express.Router();

  router.get('/:id', (req: express.Request, res: express.Response) => {
    getRepositoryBadge(req.params.id).then(status => {
      let background = null;
      if (status === 'failing') {
        background = '#f03e3e';
      } else if (status === 'running') {
        background = '#ffd43b';
      } else if (status === 'queued') {
        background = '#ffd43b';
      } else {
        background = '#39B54A';
      }

      let html = `
        <svg xmlns="http://www.w3.org/2000/svg" width="97" height="20" style="shape-rendering:
          geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd;
          clip-rule:evenodd">
          <linearGradient id="b" x2="0" y2="100%">
            <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
            <stop offset="1" stop-opacity=".1"/>
          </linearGradient>
          <mask id="a">
            <rect width="97" height="20" rx="3" fill="#fff"/>
          </mask>
          <g mask="url(#a)">
            <path fill="#333" d="M0 0h53v20H0z"/>
            <path fill="` + background + `" d="M53 0h75v20H53z"/>
            <path fill="url(#b)" d="M0 0h97v20H0z"/>
          </g>
          <g transform="matrix(0.27,0,0,0.27,3,2.7)">
            <circle fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#FFFFFF"
              stroke-width="3px" stroke-linecap="round" stroke-linejoin="round"
              stroke-miterlimit="10" cx="27" cy="27" r="26"/>
            <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF"
    d="M24.83,25.84c0.01,1.54,0.01,3.08,0.01,4.63
    c0.02,0.96,0.18,1.99,0.79,2.76c0.69,0.88,1.83,1.27,2.9,1.35c1.16,0.06,
    2.4,0.07,3.44-0.53c1-0.57,1.53-1.7,
    1.66-2.81c0.19-1.26,0.12-2.62-0.57-3.73c-0.69-1.1-2.03-1.66-3.28-1.67H24.83z
    M19.18,11.57c1.1-1.1,2.99-1.24,4.25-0.33c0.88,0.6,
    1.48,1.65,1.41,2.73v4.65c-0.01,0.19,0,0.53,0.1,0.53c1.74-0.01,3.48,0,
    5.21-0.01c2.04-0.06,4.11,0.5,5.85,1.57c1.48,0.92,2.69,2.28,3.41,3.88c0.79,
    1.71,1.04,3.61,1.01,5.49c0,2.09-0.32,4.24-1.3,6.12c-0.82,
    1.65-2.19,3.01-3.84,3.84c-1.78,0.92-3.78,1.29-5.77,
    1.36c-2.3-0.04-4.68-0.41-6.66-1.67c-1.92-1.19-3.2-3.18-3.85-5.29c-0.77-2.47-0.85-5.08-0.85-7.64
    c-0.02-0.32,0.12-0.66-0.02-0.98c-0.75-0.04-1.5,
    0.07-2.22-0.11c-1.04-0.27-1.93-1.1-2.29-2.12c-0.32-0.89-0.24-1.92,0.21-2.75
    c0.46-0.82,1.25-1.45,2.16-1.67c0.7-0.06,1.41-0.01,2.1-0.02c-0.01-1.6,
    0-3.2-0.01-4.81C18.09,13.33,18.42,12.27,19.18,11.57z"/>
          </g>
          <g fill="#fff" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="9">
            <text x="22" y="15" fill="#010101" fill-opacity=".3">build</text>
            <text x="22" y="14">build</text>
            <text x="58" y="15" fill="#010101" fill-opacity=".3">` + status + `</text>
            <text x="58" y="14">` + status + `</text>
          </g>
        </svg>
      `;

      res.writeHead(200, {'Content-Type': 'image/svg+xml'});
      res.write(html);
      res.end();
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

  router.get('/docker-image', (req: express.Request, res: express.Response) => {
    imageExists('abstruse').subscribe(exists => {
      return res.status(200).json({ data: exists });
    });
  });

  return router;
}

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(resolve(__dirname, '../app/index.html'));
}
