import * as express from 'express';
import { decodeToken } from '../security';
import { LogMessageType, logger } from '../logger';
import { getBaseImages, startImageBuild, getBuildImages, createImage } from '../images';
import { getFilePath } from '../setup';

export const imagesRouter = express.Router();

interface DockerImage {
  repository: string;
  id?: string;
  created?: number;
  tag?: string;
  size?: number;
  ready?: boolean;
}

imagesRouter.get('/build', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return Promise.resolve(false);
      } else {
        return getBuildImages();
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

imagesRouter.post('/build', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return Promise.resolve(false);
      } else {
        return createImage(req.body);
      }
    })
    .then(success => {
      if (!success) {
        return res.status(403).json({ error: 'auth error' });
      } else {
        return res.status(200).json({ data: 'OK' });
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

imagesRouter.post('/base', (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization || '';
  const imageName = req.body.imageName;

  return decodeToken(token)
    .then(userData => {
      if (!userData) {
        return Promise.resolve(false);
      } else {
        const name = imageName.split(':')[0];
        const filesPath = getFilePath(`docker/base-images/${name}`);
        startImageBuild(imageName, filesPath);
        return Promise.resolve(true);
      }
    })
    .then(resp => {
      if (!resp) {
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
