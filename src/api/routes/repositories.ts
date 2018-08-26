import * as express from 'express';
import { decodeToken } from '../security';
import * as dbRepository from '../db/repository';
import { LogMessageType, logger } from '../logger';

export const repositoriesRouter = express.Router();

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
