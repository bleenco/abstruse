import * as express from 'express';
import { decodeToken } from '../security';
import { LogMessageType, logger } from '../logger';
import { getAccessTokens } from '../db/access-token';

export const accessTokenRouter = express.Router();

accessTokenRouter.get('/', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return Promise.resolve(false);
      } else {
        return getAccessTokens();
      }
    })
    .then(accessTokens => {
      if (!accessTokens) {
        return res.status(403).json({ data: 'auth error' });
      } else {
        return res.status(200).json({ data: accessTokens });
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
