import * as express from 'express';
import * as dbUser from '../db/user';
import { decodeToken } from '../security';
import { LogMessageType, logger } from '../logger';

export const teamRouter = express.Router();

teamRouter.get('/', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then(userData => !userData ? Promise.resolve(false) : dbUser.getUsers())
    .then(users => {
      if (!users) {
        return res.status(403).json({ error: 'auth error' });
      } else {
        return res.status(200).json({ data: users });
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

teamRouter.post('/user', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then(data => {
      if (!data || (!data.admin && data.id !== req.body.id)) {
        return Promise.resolve(false);
      } else {
        return req.body.id ? dbUser.updateUser(req.body) : dbUser.createUser(req.body);
      }
    })
    .then(result => {
      if (!result) {
        return res.status(403).json({ error: 'auth error' });
      } else {
        return res.status(200).json({ data: 'ok' });
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
