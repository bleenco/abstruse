import * as express from 'express';
import { decodeToken } from '../security';
import * as dbRepository from '../db/repository';
import { LogMessageType, logger } from '../logger';
import { getBitBucketAccessToken } from '../utils';
import { checkRepositoryAccess, Repository, checkConfigPresence, getRemoteParsedConfig } from '../config';

export const repositoriesRouter = express.Router();

class CheckRepoConfig {
  constructor(
    public readPermissions: boolean = false,
    public includesConfig: boolean = false,
    public canParseConfig: boolean = false
  ) { }
}

repositoriesRouter.get('/', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';
  const keyword = req.query.keyword || '';

  return decodeToken(token)
    .then(data => {
      if (!data) {
        return dbRepository.getRepositories(keyword);
      } else {
        return dbRepository.getRepositories(keyword, data.id);
      }
    })
    .then(repositories => {
      return res.status(200).json({ data: repositories });
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      return res.status(500).json({ data: err });
    });
});

repositoriesRouter.get('/:id', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then(data => {
      if (!data) {
        return dbRepository.getRepository(req.params.id);
      } else {
        return dbRepository.getRepository(req.params.id, data.id);
      }
    })
    .then(repository => {
      return res.status(200).json({ data: repository });
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      return res.status(500).json({ data: err });
    });
});

repositoriesRouter.get('/:id/builds', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';
  const { limit, offset } = req.query;

  return decodeToken(token)
    .then((data): any => {
      if (!data) {
        return dbRepository.getRepositoryBuilds(Number(req.params.id), Number(limit), Number(offset), null);
      } else {
        return dbRepository.getRepositoryBuilds(Number(req.params.id), Number(limit), Number(offset), data.id);
      }
    })
    .then(builds => {
      return res.status(200).json({ data: builds });
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      return res.status(500).json({ data: err });
    });
});

repositoriesRouter.get('/:id/config/check', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then((data): any => {
      if (!data) {
        return Promise.resolve(false);
      } else {
        return checkRepositoryConfiguration(req.params.id);
      }
    })
    .then(result => {
      if (!result) {
        return res.status(403).json({ data: 'auth error' });
      } else {
        return res.status(200).json({ data: result });
      }
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      return res.status(500).json({ data: err });
    });
});

function checkRepositoryConfiguration(id: number): Promise<CheckRepoConfig> {
  const config = new CheckRepoConfig();
  let repository = null;
  let repoAuth: Repository = null;
  return dbRepository.getRepository(id)
    .then(repo => {
      repository = repo;
      const token = repo.access_token || null;
      if (token) {
        if (token.type === 'bitbucket' && repo.repository_provider === 'bitbucket') {
          const creds = `${token.bitbucket_oauth_key}:${token.bitbucket_oauth_secret}`;
          return getBitBucketAccessToken(creds)
            .then(resp => `${token.bitbucket_client_id}:${resp.access_token}`);
        } else if (token.type === 'gitlab' && repo.repository_provider === 'gitlab') {
          if (token.token && token.gitlab_username) {
            return Promise.resolve(`${token.gitlab_username}:${token.token}`);
          } else {
            return Promise.resolve();
          }
        } else if (token.token) {
          return Promise.resolve(token.token);
        }
      } else {
        return Promise.resolve();
      }
    })
    .then(access_token => {
      repoAuth = {
        clone_url: repository.clone_url,
        branch: repository.default_branch,
        access_token
      };
      return checkRepositoryAccess(repoAuth);
    })
    .then(hasAccess => config.readPermissions = hasAccess)
    .then(() => {
      if (config.readPermissions) {
        return checkConfigPresence(repoAuth);
      } else {
        return Promise.resolve(false);
      }
    })
    .then(includesConfig => config.includesConfig = includesConfig)
    .then((): any => {
      if (config.includesConfig) {
        return getRemoteParsedConfig(repoAuth);
      } else {
        return Promise.resolve(false);
      }
    })
    .then(parsedConfig => config.canParseConfig = !!parsedConfig)
    .then(() => config);
}
