import * as express from 'express';
import * as dbBuild from '../db/build';
import * as dbJob from '../db/job';
import { decodeToken } from '../security';
import { LogMessageType, logger } from '../logger';

export const buildsRouter = express.Router();

buildsRouter.get('/', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';
  const { limit, offset, filter } = req.query;

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return dbBuild.getBuilds(Number(limit), Number(offset), filter);
      } else {
        return dbBuild.getBuilds(Number(limit), Number(offset), filter, userData.id);
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

buildsRouter.get('/:id', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';
  const id = req.params.id;

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return dbBuild.getBuild(id);
      } else {
        return dbBuild.getBuild(id, userData.id);
      }
    })
    .then(build => {
      return res.status(200).json({ data: build });
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      return res.status(500).json({ data: err });
    });
});

buildsRouter.get('/:id/:jobid', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';
  const id = req.params.id;
  const jobid = req.params.jobid;

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return dbJob.getJob(jobid, id);
      } else {
        return dbJob.getJob(jobid, id, userData.id);
      }
    })
    .then(job => {
      return res.status(200).json({ data: job });
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      return res.status(500).json({ data: err });
    });
});
