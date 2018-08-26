import * as express from 'express';
import { getRepositoryBadge, getRepositoryId } from '../db/repository';
import { generateBadgeHtml } from '../utils';

export const badgeRouter = express.Router();

badgeRouter.get('/:id', (req: express.Request, res: express.Response) => {
  getRepositoryBadge(req.params.id)
    .then(status => {
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      });
      res.write(generateBadgeHtml(status));
      res.end();
    })
    .catch(err => res.status(500).json({ data: err }));
});

badgeRouter.get('/:owner/:repository', (req: express.Request, res: express.Response) => {
  getRepositoryId(req.params.owner, req.params.repository)
    .then(id => getRepositoryBadge(id))
    .then(status => {
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      });
      res.write(generateBadgeHtml(status));
      res.end();
    })
    .catch(err => res.status(500).json({ data: err }));
});
