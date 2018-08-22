import * as express from 'express';
import { decodeToken } from '../security';
import { LogMessageType, logger } from '../logger';
import { getBaseImages } from '../images';

export const imagesRouter = express.Router();

interface DockerImage {
  repository: string;
  id?: string;
  created?: number;
  tag?: string;
  size?: number;
  ready?: boolean;
}

imagesRouter.get('/base', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return Promise.resolve(false);
      } else {
        return getBaseImages();
      }
    })
    .then(images => {
      if (!images) {
        return res.status(403).json({ error: 'auth error' });
      } else {
        return res.status(200).json({ data: images });
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
