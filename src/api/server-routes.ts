import * as express from 'express';
import * as docker from './docker';
import * as system from './system';
import * as utils from './utils';
import { resolve, extname, relative } from 'path';
import { Observable } from 'rxjs';
import { exists } from './fs';
import { getFilePath, generateBadgeHtml, getConfig } from './utils';
import { reinitializeDatabase } from './db/migrations';
import {
  usersExists,
  createUser,
  login,
  getUser,
  updateUser,
  updateUserPassword,
  getUsers,
  getUserJwt
} from './db/user';
import {
  addRepository,
  getRepositories,
  getRepository,
  getRepositoryBadge,
  getRepositoryId,
  getRepositoryBuilds,
  saveRepositorySettings
} from './db/repository';
import { getBuilds, getBuild, getLastBuild } from './db/build';
import { getJob } from './db/job';
import { insertAccessToken, getAccessTokens } from './db/access-token';
import {
  updatePermission,
  getUserRepositoryPermissions,
  getUserBuildPermissions,
  getUserJobPermissions
} from './db/permission';
import { insertEnvironmentVariable, removeEnvironmentVariable } from './db/environment-variable';
import { imageExists } from './docker';
import { checkApiRequestAuth } from './security';
import * as multer from 'multer';

const config: any = getConfig();

const storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, utils.getFilePath('avatars'));
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload: multer.Instance = multer({ storage: storage });

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

  router.get('/limit/:limit/offset/:offset/:filter/:userid?',
    (req: express.Request, res: express.Response) => {
      if (req.params.userid) {
        getBuilds(req.params.limit, req.params.offset, req.params.filter, req.params.userid)
          .then(builds => {
            return res.status(200).json({ data: builds });
          })
          .catch(err => res.status(200).json({ err: err }));
      } else {
        getBuilds(req.params.limit, req.params.offset, req.params.filter).then(builds => {
          return res.status(200).json({ data: builds });
        })
        .catch(err => res.status(200).json({ err: err }));
      }
  });

  router.get('/last/:userid?', (req: express.Request, res: express.Response) => {
    if (req.params.userid) {
      getLastBuild(req.params.userid)
        .then(build => res.status(200).json({ data: build }))
        .catch(err => res.status(200).json({ err: err }));
    } else {
      getLastBuild()
        .then(build => res.status(200).json({ data: build }))
        .catch(err => res.status(200).json({ err: err }));
    }
  });

  router.get('/:id/:userid?', (req: express.Request, res: express.Response) => {
    if (req.params.userid) {
      getBuild(req.params.id, req.params.userid).then(build => {
        return res.status(200).json({ data: build });
      });
    } else {
      getBuild(req.params.id).then(build => {
        return res.status(200).json({ data: build });
      });
    }
  });

  return router;
}

export function jobRoutes(): express.Router {
  const router = express.Router();

  router.get('/:id/:userid?', (req: express.Request, res: express.Response) => {
    if (req.params.userid) {
      getJob(req.params.id, req.params.userid).then(job => {
        return res.status(200).json({ data: job });
      });
    } else {
      getJob(req.params.id, req.params.userid).then(job => {
        return res.status(200).json({ data: job });
      });
    }
  });

  return router;
}

export function userRoutes(): express.Router {
  const router = express.Router();

  router.get('/', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        getUsers().then(users => {
          return res.status(200).json({ data: users });
        }).catch(err => {
          return res.status(200).json({ err: err });
        });
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/login', (req: express.Request, res: express.Response) => {
    login(req.body).then(credentials => {
      res.status(200).json({ data: credentials });
    });
  });

  router.post('/create', (req: express.Request, res: express.Response) => {
    createUser(req.body)
      .then(() => res.status(200).json({ status: true }))
      .catch(err => res.status(200).json({ status: false }));
  });

  router.post('/save', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        updateUser(req.body).then(() => {
          return res.status(200).json({ data: true });
        }).catch(err => {
          return res.status(200).json({ data: false });
        });
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/update-password', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        updateUserPassword(req.body).then(() => {
          return res.status(200).json({ data: true });
        }).catch(err => {
          return res.status(200).json({ data: false });
        });
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.get('/:id', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        getUser(req.params.id)
          .then(user => res.status(200).json({ data: user }))
          .catch(err => res.status(400).json({ err: err }));
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/add-token', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        insertAccessToken(req.body)
          .then(() => res.status(200).json({ data: true }))
          .catch(() => res.status(200).json({ data: false }));
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/upload-avatar', upload.any(), (req: express.Request, res: express.Response) => {
    const avatar = '/' + relative(utils.getRootDir(), req.files[0].path);
    getUser(req.body.userId)
      .then(user => {
        user.avatar = avatar;
        return updateUser(user);
      })
      .then(user => getUserJwt(user))
      .then(jwt => res.status(200).json({ data: jwt }));
  });

  return router;
}

export function tokenRoutes(): express.Router {
  const router = express.Router();

  router.get('/', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        getAccessTokens()
          .then(tokens => res.status(200).json({ data: tokens }))
          .catch(() => res.status(200).json({ data: false }));
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  return router;
}

export function repositoryRoutes(): express.Router {
  const router = express.Router();

  router.get('/:userid?', (req: express.Request, res: express.Response) => {
    if (req.params.userid) {
      getRepositories(req.query.keyword, req.params.userid).then(repos => {
        return res.status(200).json({ data: repos });
      }).catch(err => res.status(200).json({ status: false }));
    } else {
      getRepositories(req.query.keyword).then(repos => {
        return res.status(200).json({ data: repos });
      }).catch(err => res.status(200).json({ status: false }));
    }
  });

  router.get('/id/:id', (req: express.Request, res: express.Response) => {
    getRepository(req.params.id).then(repo => {
      return res.status(200).json({ data: repo });
    }).catch(err => res.status(200).json({ status: false }));
  });

  router.get('/:id/builds/:limit/:offset', (req: express.Request, res: express.Response) => {
    getRepositoryBuilds(req.params.id, req.params.limit, req.params.offset)
      .then(builds => res.status(200).json({ data: builds }))
      .catch(err => res.status(200).json({ status: false }));
  });

  router.post('/add', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        addRepository(req.body).then(result => {
          return res.status(200).json({ status: true });
        }).catch(err => res.status(200).json({ status: false }));
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/save', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        saveRepositorySettings(req.body)
          .then(() => res.status(200).json({ data: true }))
          .catch(() => res.status(200).json({ data: false }));
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/permission', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      updatePermission(req.body)
        .then(() => res.status(200).json({ data: true }))
        .catch(() => res.status(200).json({ data: false }));
    }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  return router;
}

export function badgeRoutes(): express.Router {
  const router = express.Router();

  router.get('/:id', (req: express.Request, res: express.Response) => {
    getRepositoryBadge(req.params.id).then(status => {
      res.writeHead(200, {'Content-Type': 'image/svg+xml'});
      res.write(generateBadgeHtml(status));
      res.end();
    });
  });

  router.get('/:owner/:repository', (req: express.Request, res: express.Response) => {
    getRepositoryId(req.params.owner, req.params.repository)
      .then(id => getRepositoryBadge(id))
      .then(status => {
        res.writeHead(200, {'Content-Type': 'image/svg+xml'});
        res.write(generateBadgeHtml(status));
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

  router.get('/login-required', (req: express.Request, res: express.Response) => {
    return res.status(200).json({ data: config.requireLogin });
  });

  return router;
}

export function permissionRoutes(): express.Router {
  const router = express.Router();

  router.get('/repository/:repoId/user/:userId', (req: express.Request, res: express.Response) => {
    getUserRepositoryPermissions(req.params.userId, req.params.repoId).then(perm => {
      return res.status(200).json({ data: perm });
    }).catch(err => res.status(200).json({ status: false }));
  });

  router.get('/build/:buildId/user/:userId', (req: express.Request, res: express.Response) => {
    getUserBuildPermissions(req.params.userId, req.params.buildId).then(perm => {
      return res.status(200).json({ data: perm });
    }).catch(err => res.status(200).json({ status: false }));
  });

  router.get('/job/:jobId/user/:userId', (req: express.Request, res: express.Response) => {
    getUserJobPermissions(req.params.userId, req.params.jobId).then(perm => {
      return res.status(200).json({ data: perm });
    }).catch(err => res.status(200).json({ status: false }));
  });

  return router;
}

export function environmentVariableRoutes(): express.Router {
  const router = express.Router();

  router.post('/add', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      insertEnvironmentVariable(req.body)
        .then(() => res.status(200).json({ data: true }))
        .catch(() => res.status(200).json({ data: false }));
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.get('/remove/:id', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      removeEnvironmentVariable(req.params.id)
        .then(() => res.status(200).json({ data: true }))
        .catch(() => res.status(200).json({ data: false }));
    }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  return router;
}

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(resolve(__dirname, '../app/index.html'));
}
