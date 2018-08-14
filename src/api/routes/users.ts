import * as express from 'express';
import * as dbUser from '../db/user';
import { LogMessageType, logger } from '../logger';
import { checkSetupDone } from '../setup';

export const usersRouter = express.Router();

usersRouter.get('/', (req: express.Request, res: express.Response) => {
  let setupDone: boolean;

  return Promise.resolve()
    .then(() => checkSetupDone())
    .then(done => setupDone = done)
    .then(() => !setupDone ? dbUser.getUsers() : Promise.resolve(false))
    .then(result => {
      if (result) {
        res.status(200).json({ data: result });
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
  let usersExists: boolean;
  let setupDone: boolean;

  return Promise.resolve()
    .then(() => dbUser.usersExists())
    .then(exists => usersExists = exists)
    .then(() => checkSetupDone())
    .then(done => setupDone = done)
    .then(() => {
      if (!usersExists || !setupDone) {
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
