import * as express from 'express';
import * as dbUser from '../db/user';
import { LogMessageType, logger } from '../logger';

export const usersRouter = express.Router();

usersRouter.get('/exists', (req: express.Request, res: express.Response) => {
  return dbUser.usersExists()
    .then(exists => {
      res.status(200).json({ data: exists });
    })
    .catch(err => {
      const logMessage: LogMessageType = {
        type: 'error', message: err, notify: false
      };
      logger.next(logMessage);
      res.status(500).json({ data: err });
    });
});

usersRouter.post('/new', (req: express.Request, res: express.Response) => {
  return dbUser.usersExists()
    .then(exists => {
      if (!exists) {
        return dbUser.createUser(req.body);
      } else {
        return Promise.resolve(false);
      }
    })
    .then(result => {
      if (result) {
        res.status(200).json({ data: 'ok' });
      } else {
        res.status(500).json({ data: 'internal server error' });
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
