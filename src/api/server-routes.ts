import * as express from 'express';
import * as docker from './docker';
import * as system from './system';
import * as utils from './utils';
import { resolve, extname, relative } from 'path';
import { Observable } from 'rxjs';
import { exists } from './fs';
import { readFileSync } from 'fs';
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
import { getBuilds, getBuild } from './db/build';
import { getJob, getLastRun } from './db/job';
import { getJobRuns, getJobRunsBetween } from './db/job-run';
import { insertAccessToken, getAccessTokens, removeAccessToken } from './db/access-token';
import {
  updatePermission,
  getUserRepositoryPermissions,
  getUserBuildPermissions,
  getUserJobPermissions
} from './db/permission';
import { insertEnvironmentVariable, removeEnvironmentVariable } from './db/environment-variable';
import { getLogs } from './db/log';
import { imageExists } from './docker';
import { getImages, buildAbstruseBaseImage, deleteImage, buildDockerImage } from './image-builder';
import { checkApiRequestAuth } from './security';
import {
  checkConfigPresence,
  checkRepositoryAccess,
  Repository,
  getRemoteParsedConfig,
  getConfigRawFile,
  parseConfigFromRaw
} from './config';
import { getHttpJsonResponse, generateBadgeHtml } from './utils';
import {
  getCacheFilesFromPattern,
  deleteCacheFilesFromPattern,
  getFilePath,
  getConfig,
  getRootDir
} from './setup';
import { startBuild } from './process-manager';
import * as multer from 'multer';
import * as stripAnsi from 'strip-ansi';

let config: any = getConfig();

let storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getFilePath('avatars'));
  },
  filename: (req, file, cb) => {
    let ext = extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

let upload: multer.Instance = multer({ storage: storage });

export function webRoutes(): express.Router {
  let router = express.Router();

  router.use('/', express.static(resolve(__dirname, '../app'), { index: false }));
  router.use('/assets', express.static(resolve(__dirname, '../app/assets'), { index: false }));
  router.use('/avatars', express.static(getFilePath('avatars'), { index: false }));

  router.get('/setup', index);
  router.get('/login', index);
  router.all('/*', index);

  return router;
}

export function buildRoutes(): express.Router {
  let router = express.Router();

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

  router.get('/:id/:userid?', (req: express.Request, res: express.Response) => {
    if (req.params.userid) {
      getBuild(req.params.id, req.params.userid).then(build => {
        return res.status(200).json({ data: build });
      })
        .catch(err => res.status(200).json({ err: err }));
    } else {
      getBuild(req.params.id).then(build => {
        return res.status(200).json({ data: build });
      })
        .catch(err => res.status(200).json({ err: err }));
    }
  });

  return router;
}

export function jobRoutes(): express.Router {
  let router = express.Router();

  router.get('/:id/log', (req: express.Request, res: express.Response) => {
    getLastRun(req.params.id).then(jobRun => {
      if (jobRun && jobRun.log) {
        let log = stripAnsi(jobRun.log.replace(/\r\n/g, '<br/>'));
        return res.status(200).type('html').send(log);
      } else {
        return res.status(404).json({ data: 'not found' });
      }
    })
      .catch(err => res.status(200).json({ err: err }));
  });

  router.get('/:id/:userid?', (req: express.Request, res: express.Response) => {
    getJob(req.params.id, req.params.userid).then(job => {
      return res.status(200).json({ data: job });
    })
      .catch(err => res.status(200).json({ err: err }));
  });

  return router;
}

export function userRoutes(): express.Router {
  let router = express.Router();

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
    getUsers().then(users => {
      if (users && users.length) {
        checkApiRequestAuth(req).then(() => {
          createUser(req.body)
            .then(() => res.status(200).json({ status: true }))
            .catch(err => res.status(200).json({ status: false }));
        }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
      } else {
        createUser(req.body)
          .then(() => res.status(200).json({ status: true }))
          .catch(err => res.status(200).json({ status: false }));
      }
    }).catch(err => res.status(200).json({ data: false }));
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

  router.get('/remove-token/:id', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req)
      .then(() => {
        removeAccessToken(req.params.id)
          .then(() => res.status(200).json({ data: true }))
          .catch(() => res.status(200).json({ data: false }));
      }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/upload-avatar', upload.any(), (req: express.Request, res: express.Response) => {
    let avatar = '/' + relative(getRootDir(), req.files[0].path);
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
  let router = express.Router();

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
  let router = express.Router();

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

  router.get('/id/:id/:userid?', (req: express.Request, res: express.Response) => {
    if (req.params.userid) {
      getRepository(req.params.id, req.params.userid).then(repo => {
        delete repo.access_token;
        return res.status(200).json({ data: repo });
      }).catch(err => res.status(200).json({ status: false }));
    } else {
      getRepository(req.params.id).then(repo => {
        delete repo.access_token;
        return res.status(200).json({ data: repo });
      }).catch(err => res.status(200).json({ status: false }));
    }
  });

  router.get('/:id/builds/:limit/:offset/:userid?',
    (req: express.Request, res: express.Response) => {
      getRepositoryBuilds(req.params.id, req.params.limit, req.params.offset, req.params.userid)
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

  router.get('/check/:id', (req: express.Request, res: express.Response) => {
    let repository: Repository = null;
    getRepository(req.params.id).then(repo => {
      let accessToken = null;
      if (repo.access_token) {
        if (repo.access_token.is_integration && repo.access_token.token) {
          accessToken = `x-access-token:${repo.access_token.token}`;
        } else {
          accessToken = repo.access_token.token || null;
        }
      }
      repository = {
        clone_url: repo.clone_url,
        branch: repo.default_branch,
        access_token: accessToken
      };

      return checkRepositoryAccess(repository);
    })
      .then(hasAccess => {
        if (!hasAccess) {
          throw { data: { read: false, config: false, parsedcfg: false } };
        } else {
          return checkConfigPresence(repository);
        }
      })
      .then(configPresence => {
        if (!configPresence) {
          throw { data: { read: true, config: false, parsedcfg: false } };
        } else {
          return getRemoteParsedConfig(repository);
        }
      })
      .then(parsedCfg => {
        if (!parsedCfg) {
          res.status(200).json({ data: { read: true, config: true, parsedcfg: false } });
        } else {
          res.status(200).json({ data: { read: true, config: true, parsedcfg: parsedCfg } });
        }
      }).catch(err => res.status(200).json(err.data ? { data: err.data } : { err: err.message }));
  });

  router.get('/trigger-test-build/:id', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      getRepository(req.params.id)
        .then(repository => {
          if (!repository.api_url || !repository.repository_provider) {
            res.status(200).json({ data: false });
            return Promise.reject(null);
          }

          if (repository.repository_provider === 'github') {
            let url = repository.api_url + '/repos/' + repository.full_name + '/commits/' +
              repository.default_branch;
            let accessToken = null;

            if (repository.access_token) {
                accessToken = repository.access_token.token || null;
            }
            const header = {
              Authorization: `token ${accessToken}`,
             };
            return getHttpJsonResponse(url, accessToken ? { headers: header } : null);
          } else if (repository.repository_provider === 'gitlab') {
            let url = repository.api_url + '/projects/' +
              repository.gitlab_id + '/repository/branches/master';

            let accessToken = null;
            if (repository.access_token) {
              accessToken = repository.access_token.token || null;
            }

            if (accessToken) {
              url = url.replace('//', `//${accessToken}@`);
            }

            return getHttpJsonResponse(url);
          } else if (repository.repository_provider === 'bitbucket') {
            let url = repository.api_url + '/' + repository.user_login + '/' + repository.name +
              '/commits/master';
            let accessToken = null;
            if (repository.access_token) {
              accessToken = repository.access_token.token || null;
            }

            if (accessToken) {
              url = url.replace('//', `//${accessToken}@`);
            }

            return getHttpJsonResponse(url).then(payload => payload.values[0]);
          } else if (repository.repository_provider === 'gogs') {
            let url = repository.api_url + '/api/v1/' + repository.user_login +
              '/repos/' + repository.full_name + '/branches/master';
            let accessToken = null;
            if (repository.access_token) {
              if (repository.access_token.is_integration && repository.access_token.token) {
                accessToken = `x-access-token:${repository.access_token.token}`;
              } else {
                accessToken = repository.access_token.token || null;
              }
            }

            if (accessToken) {
              url = url.replace('//', `//${accessToken}@`);
            }

            return getHttpJsonResponse(url);
          }
        })
        .then(payload => {
          let buildData = {
            data: payload,
            start_time: new Date(),
            repositories_id: req.params.id
          };

          return startBuild(buildData);
        })
        .then(() => res.status(200).json({ data: true }))
        .catch(err => res.status(200).json({ data: false }));
    }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.get('/get-config-file/:id', (req: express.Request, res: express.Response) => {
    let repository = null;
    getRepository(req.params.id)
      .then(repo => {
        let accessToken = null;
        if (repo.access_token) {
          if (repo.access_token.is_integration && repo.access_token.token) {
            accessToken = `x-access-token:${repo.access_token.token}`;
          } else {
            accessToken = repo.access_token.token || null;
          }
        }
        repository = {
          clone_url: repo.clone_url,
          branch: repo.default_branch,
          access_token: accessToken
        };

        return getConfigRawFile(repository);
      })
      .then(rawFile => {
        if (!rawFile) {
          res.status(200).json({ data: false });
        } else {
          res.status(200).json({ data: rawFile });
        }
      })
      .catch(err => res.status(200).json({ data: false }));
  });

  router.post('/run-build-config', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      let repo: Repository = null;
      let payload: any = null;
      getRepository(req.body.id)
        .then(repository => {
          if (!repository.api_url || !repository.repository_provider) {
            res.status(200).json({ data: false });
            return Promise.reject(null);
          }

          let accessToken = null;
          if (repository.access_token) {
            if (repository.access_token.is_integration && repository.access_token.token) {
              accessToken = `x-access-token:${repository.access_token.token}`;
            } else {
              accessToken = repository.access_token.token || null;
            }
          }
          repo = {
            clone_url: repository.clone_url,
            branch: repository.default_branch,
            access_token: accessToken
          };

          if (repository.repository_provider === 'github') {
            let url = `${repository.api_url}/repos/${repository.full_name}/commits/${repository.default_branch}`;

            if (accessToken) {
              url = url.replace('//', `//${accessToken}@`);
            }

            return getHttpJsonResponse(url);
          }
        })
        .then(load => payload = load)
        .then(() => parseConfigFromRaw(repo, req.body.config))
        .then(cfg => {
          let buildData = {
            data: payload,
            start_time: new Date(),
            repositories_id: req.body.id
          };

          return startBuild(buildData, cfg);
        })
        .then(() => res.status(200).json({ data: true }))
        .catch(err => res.status(200).json({ data: false }));
    }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.get('/get-cache/:id', (req: express.Request, res: express.Response) => {
    getRepository(req.params.id)
      .then(repo => {
        let searchPattern = `cache_${repo.full_name.replace('/', '-')}*`;
        res.status(200).json({ data: getCacheFilesFromPattern(searchPattern) });
      })
      .catch(err => res.status(200).json({ err: err }));
  });

  router.get('/delete-cache/:id', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      getRepository(req.params.id)
        .then(repo => {
          let searchPattern = `cache_${repo.full_name.replace('/', '-')}*`;
          return deleteCacheFilesFromPattern(searchPattern);
        })
        .then(() => res.status(200).json({ data: true }))
        .catch(err => res.status(200).json({ data: false }));
    }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  return router;
}

export function badgeRoutes(): express.Router {
  let router = express.Router();

  router.get('/:id', (req: express.Request, res: express.Response) => {
    getRepositoryBadge(req.params.id).then(status => {
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      });
      res.write(generateBadgeHtml(status));
      res.end();
    }).catch(err => res.status(200).json({ status: false }));
  });

  router.get('/:owner/:repository', (req: express.Request, res: express.Response) => {
    getRepositoryId(req.params.owner, req.params.repository)
      .then(id => getRepositoryBadge(id))
      .then(status => {
        res.writeHead(200, {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        });
        res.write(generateBadgeHtml(status));
        res.end();
      }).catch(err => res.status(200).json({ status: false }));
  });

  return router;
}

export function setupRoutes(): express.Router {
  let router = express.Router();

  router.get('/ready', (req: express.Request, res: express.Response) => {
    Observable.merge(...[
      system.isGitInstalled(),
      system.isSQLiteInstalled(),
      docker.isDockerInstalled(),
      docker.isDockerRunning(),
      Observable.fromPromise(exists(getFilePath('config.json'))),
      Observable.fromPromise(exists(getFilePath('abstruse.sqlite'))),
      Observable.fromPromise(usersExists())
    ])
      .toArray()
      .subscribe(data => {
        let isFalse = data.findIndex(x => !x);
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
    Observable.concat(...[
      system.isGitInstalled(),
      system.isSQLiteInstalled(),
      docker.isDockerInstalled()
    ])
      .toArray()
      .subscribe(data => {
        if (data[2]) {
          docker.isDockerRunning().subscribe(dockerRunning => {
            let status = {
              sqlite: data[1], docker: data[2], dockerRunning: dockerRunning, git: data[0]
            };
            res.status(200).json({ data: status });
          });
        } else {
          let status = {
            sqlite: data[1], docker: false, dockerRunning: false, git: data[0]
          };
          res.status(200).json({ data: status });
        }
      });
  });

  router.post('/db/init', (req: express.Request, res: express.Response) => {
    getUsers().then(users => {
      if (users && users.length) {
        checkApiRequestAuth(req).then(() => {
          reinitializeDatabase().then(() => {
            return res.status(200).json({ data: true });
          });
        }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
      } else {
        reinitializeDatabase().then(() => {
          return res.status(200).json({ data: true });
        });
      }
    });
  });

  router.get('/docker-image', (req: express.Request, res: express.Response) => {
    imageExists('abstruse').subscribe(baseImageExists => {
      return res.status(200).json({ data: baseImageExists });
    });
  });

  router.get('/login-required', (req: express.Request, res: express.Response) => {
    return res.status(200).json({ data: config.requireLogin });
  });

  return router;
}

export function permissionRoutes(): express.Router {
  let router = express.Router();

  router.get('/repository/:repoId/user/:userId?', (req: express.Request, res: express.Response) => {
    if (req.params.userId) {
      getUserRepositoryPermissions(req.params.repoId, req.params.userId).then(perm => {
        return res.status(200).json({ data: perm });
      }).catch(err => res.status(200).json({ status: false }));
    } else {
      getUserRepositoryPermissions(req.params.repoId).then(perm => {
        return res.status(200).json({ data: perm });
      }).catch(err => res.status(200).json({ status: false }));
    }
  });

  router.get('/build/:buildId/user/:userId?', (req: express.Request, res: express.Response) => {
    if (req.params.userId) {
      getUserBuildPermissions(req.params.buildId, req.params.userId).then(perm => {
        return res.status(200).json({ data: perm });
      }).catch(err => res.status(200).json({ status: false }));
    } else {
      getUserBuildPermissions(req.params.buildId).then(perm => res.status(200).json({ data: perm }))
        .catch(err => res.status(200).json({ status: false }));
    }
  });

  router.get('/job/:jobId/user/:userId?', (req: express.Request, res: express.Response) => {
    if (req.params.userId) {
      getUserJobPermissions(req.params.jobId, req.params.userId).then(perm => {
        return res.status(200).json({ data: perm });
      }).catch(err => res.status(200).json({ status: false }));
    } else {
      getUserJobPermissions(req.params.jobId).then(perm => {
        return res.status(200).json({ data: perm });
      }).catch(err => res.status(200).json({ status: false }));
    }
  });

  return router;
}

export function environmentVariableRoutes(): express.Router {
  let router = express.Router();

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

export function statsRoutes(): express.Router {
  let router = express.Router();

  router.get('/job-runs', (req: express.Request, res: express.Response) => {
    getJobRuns()
      .then(runs => res.status(200).json({ data: runs }))
      .catch(err => res.status(200).json({ status: false }));
  });

  router.get('/job-runs/:dateFrom/:dateTo', (req: express.Request, res: express.Response) => {
    getJobRunsBetween(req.params.dateFrom, req.params.dateTo)
      .then(runs => res.status(200).json({ data: runs }))
      .catch(err => res.status(200).json({ status: false }));
  });

  return router;
}

export function logsRoutes(): express.Router {
  let router = express.Router();

  router.get(`/:limit/:offset/:type`, (req: express.Request, res: express.Response) => {
    getLogs(req.params.limit, req.params.offset, req.params.type)
      .then(logs => res.status(200).json({ data: logs }))
      .catch(err => res.status(200).json({ status: false }));
  });

  return router;
}

export function keysRoutes(): express.Router {
  let router = express.Router();

  router.get(`/public`, (req: express.Request, res: express.Response) => {
    let cfg: any = getConfig();
    if (cfg.publicKey) {
      let keyPath = cfg.publicKey;

      return res.status(200).json({ key: readFileSync(getFilePath(keyPath)).toString() });
    }

    return res.status(200).json({ status: false });
  });

  return router;
}

export function configRoutes(): express.Router {
  let router = express.Router();

  router.get(`/demo`, (req: express.Request, res: express.Response) => {
    let cfg: any = getConfig();

    return res.status(200).json({ data: cfg.demo });
  });

  return router;
}

export function imagesRoutes(): express.Router {
  let router = express.Router();

  router.get('/', (req: express.Request, res: express.Response) => {
    getImages()
      .then(images => res.status(200).json({ data: images }))
      .catch(err => res.status(200).json({ status: false }));
  });

  router.post('/build-base', (req: express.Request, res: express.Response) => {
    buildAbstruseBaseImage();
    res.status(200).json({ data: true });
  });

  router.post('/build', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      buildDockerImage(req.body);
      res.status(200).json({ data: true });
    }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  router.post('/delete', (req: express.Request, res: express.Response) => {
    checkApiRequestAuth(req).then(() => {
      deleteImage(req.body);
      res.status(200).json({ data: true });
    }).catch(err => res.status(401).json({ data: 'Not Authorized' }));
  });

  return router;
}

function index(req: express.Request, res: express.Response): void {
  return res.status(200).sendFile(resolve(__dirname, '../app/index.html'));
}
