import * as express from 'express';
import * as crypto from 'crypto';
import { getConfig, getFilePath  } from './utils';
import { pingRepository, createPullRequest, synchronizePullRequest } from './db/repository';
import { startBuild } from './process-manager';
import { writeJsonFile } from './fs';

const config: any = getConfig();
export const webhooks = express.Router();

webhooks.post('/github', (req: express.Request, res: express.Response) => {
  const headers = req.headers;
  const payload = req.body;

  const sig = headers['x-hub-signature'] as string;
  const ev = headers['x-github-event'] as string;
  const id = headers['x-github-delivery'] as string;

  if (!sig) {
    return res.status(400).json({ error: 'No X-Hub-Signature found on request' });
  }

  if (!ev) {
    return res.status(400).json({ error: 'No X-Github-Event found on request' });
  }

  if (!id) {
    return res.status(400).json({ error: 'No X-Github-Delivery found on request' });
  }

  if (!verifyGithubWebhook(sig, payload, config.secret)) {
    return res.status(400).json({ error: 'X-Hub-Signature does not match blob signature' });
  }

  // return res.status(200).json({ msg: 'ok' });

  switch (ev) {
    case 'ping':
      let config: any = getConfig();
      config.url = req.headers.host;
      writeJsonFile(getFilePath('config.json'), config)
        .then(() => pingRepository(payload))
        .then(repo => res.status(200).json({ msg: 'ok' }))
        .catch(err => res.status(400).json(err));
    break;
    case 'push':
      pingRepository(payload)
        .then(repo => {
          const buildData = {
            data: payload,
            start_time: new Date(),
            repositories_id: repo.id
          };

          return startBuild(buildData);
        })
        .then(() => res.status(200).json({ msg: 'ok' }))
        .catch(err => {
          console.error(err);
          res.status(400).json({ error: err });
        });
    break;
    case 'pull_request':
      switch (payload.action) {
        case 'opened':
          createPullRequest(payload)
            .then(build => startBuild(build))
            .then(() => res.status(200).json({ msg: 'ok' }))
            .catch(err => {
              console.error(err);
              res.status(400).json({ error: err });
            });
        break;
        case 'closed':
          // should kill all jobs related to this PR?
          res.status(200).json({ msg: 'ok' });
        break;
        case 'reopened':
          synchronizePullRequest(payload)
            .then(build => startBuild(build))
            .then(() => res.status(200).json({ msg: 'ok' }))
            .catch(err => {
              console.error(err);
              res.status(400).json({ error: err });
            });
        break;
        case 'assigned':
          res.status(200).json({ msg: 'ok' });
        break;
        case 'unassigned':
          res.status(200).json({ msg: 'ok' });
        break;
        case 'review_requested':
          res.status(200).json({ msg: 'ok' });
        break;
        case 'review_request_removed':
          res.status(200).json({ msg: 'ok' });
        break;
        case 'labeled':
          res.status(200).json({ msg: 'ok' });
        break;
        case 'unlabeled':
          res.status(200).json({ msg: 'ok' });
        break;
        case 'edited':
          res.status(200).json({ msg: 'ok' });
        break;
        case 'synchronize':
          synchronizePullRequest(payload)
            .then(build => startBuild(build))
            .then(() => res.status(200).json({ msg: 'ok' }))
            .catch(err => {
              console.error(err);
              res.status(400).json({ error: err });
            });
        break;
      }
    break;
    default:
      res.status(200).json({ msg: 'ok' });
    break;
  }
});


webhooks.post('/bitbucket', (req: express.Request, res: express.Response) => {
  res.status(200).json({ msg: 'ok' });
});

webhooks.post('/gitlab', (req: express.Request, res: express.Response) => {
  res.status(200).json({ msg: 'ok' });
});

webhooks.post('/gogs', (req: express.Request, res: express.Response) => {
  res.status(200).json({ msg: 'ok' });
});

function verifyGithubWebhook(signature: string, payload: any, secret: string): boolean {
  const computedSig =
    `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(payload)).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSig));
}
