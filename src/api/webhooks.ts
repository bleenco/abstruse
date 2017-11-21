import * as express from 'express';
import * as crypto from 'crypto';
import { getConfig, getFilePath  } from './utils';
import {
  pingGitHubRepository,
  pingBitbucketRepository,
  synchronizeBitbucketPullRequest,
  pingGitLabRepository,
  synchronizeGitLabPullRequest,
  pingGogsRepository,
  createGitHubPullRequest,
  createGogsPullRequest,
  synchronizeGitHubPullRequest,
  synchronizeGogsPullRequest } from './db/repository';
import { startBuild } from './process-manager';
import { writeJsonFile } from './fs';

export const webhooks = express.Router();

webhooks.post('/github', (req: express.Request, res: express.Response) => {
  let config: any = getConfig();
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

  if (req.secure) {
    config.url = 'https://' + req.headers.host;
  } else {
    config.url = 'http://' + req.headers.host;
  }

  switch (ev) {
    case 'ping':
      writeJsonFile(getFilePath('config.json'), config)
        .then(() => pingGitHubRepository(payload))
        .then(repo => res.status(200).json({ msg: 'ok' }))
        .catch(err => res.status(400).json(err));
    break;
    case 'push':
      writeJsonFile(getFilePath('config.json'), config)
        .then(() => pingGitHubRepository(payload))
        .then(repo => {
          const buildData = {
            data: payload,
            start_time: new Date(),
            repositories_id: repo.id
          };

          return startBuild(buildData);
        })
        .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
        .catch(err => {
          console.error(err);
          res.status(400).json({ error: err });
        });
    break;
    case 'pull_request':
      switch (payload.action) {
        case 'opened':
        writeJsonFile(getFilePath('config.json'), config)
          .then(() => createGitHubPullRequest(payload))
          .then(build => startBuild(build))
          .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
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
          writeJsonFile(getFilePath('config.json'), config)
            .then(() => synchronizeGitHubPullRequest(payload))
            .then(build => startBuild(build))
            .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
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
          writeJsonFile(getFilePath('config.json'), config)
            .then(() => synchronizeGitHubPullRequest(payload))
            .then(build => startBuild(build))
            .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
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
  let config: any = getConfig();
  const headers = req.headers;
  const payload = req.body;

  const sig = headers['x-request-uuid'] as string;
  const ev = headers['x-event-key'] as string;
  const id = headers['x-hook-uuid'] as string;

  if (!sig) {
    return res.status(400).json({ error: 'No X-Request-UUID found on request' });
  }

  if (!ev) {
    return res.status(400).json({ error: 'No X-Event-Key found on request' });
  }

  if (!id) {
    return res.status(400).json({ error: 'No X-Hook-UUID found on request' });
  }

  if (req.secure) {
    config.url = 'https://' + req.headers.host;
  } else {
    config.url = 'http://' + req.headers.host;
  }

  switch (ev) {
    case 'repo:push':
      writeJsonFile(getFilePath('config.json'), config)
      .then(() => pingBitbucketRepository(payload))
      .then(repo => {
        const buildData = {
          data: payload,
          start_time: new Date(),
          repositories_id: repo.id
        };

        return startBuild(buildData);
      })
      .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
      .catch(err => {
        console.error(err);
        res.status(400).json({ error: err });
      });
      break;
    case 'repo:commit_status_created':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'repo:commit_status_updated':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'repo:commit_comment_created':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'repo:fork':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'issue:comment_created':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'issue:created':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'issue:updated':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'pullrequest:unapproved':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'pullrequest:approved':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'pullrequest:comment_created':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'pullrequest:comment_updated':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'pullrequest:comment_deleted':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'repo:transfer':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'repo:updated':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'pullrequest:created':
    case 'pullrequest:updated':
      writeJsonFile(getFilePath('config.json'), config)
      .then(() => synchronizeBitbucketPullRequest(payload))
      .then(build => startBuild(build))
      .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
      .catch(err => {
        console.error(err);
        res.status(400).json({ error: err });
      });
      break;
    case 'pullrequest:fulfilled':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'pullrequest:rejected':
      res.status(200).json({ msg: 'ok' });
      break;
    default:
      break;
  }
});

webhooks.post('/gitlab', (req: express.Request, res: express.Response) => {
  let config: any = getConfig();
  const headers = req.headers;
  const payload = req.body;
  const ev = headers['x-gitlab-event'] as string;
  const sig = headers['x-gitlab-token'] as string;

  if (!sig) {
    return res.status(400).json({ error: 'No X-GitLab-Token found on request' });
  }

  if (!ev) {
    return res.status(400).json({ error: 'No X-GitLab-Event found on request' });
  }

  if (sig !== config.secret) {
    return res.status(400).json({ error: 'X-GitLab-Token does not match' });
  }

  if (req.secure) {
    config.url = 'https://' + req.headers.host;
  } else {
    config.url = 'http://' + req.headers.host;
  }

  switch (ev) {
    case 'Push Hook':
      writeJsonFile(getFilePath('config.json'), config)
      .then(() => pingGitLabRepository(payload))
      .then(repo => {
        const buildData = {
          data: payload,
          start_time: new Date(),
          repositories_id: repo.id
        };

        return startBuild(buildData);
      })
      .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
      .catch(err => {
        console.error(err);
        res.status(400).json({ error: err });
      });
      break;
    case 'Wiki Page Hook':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'Build Hook':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'Note Hook':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'Issue Hook':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'Merge Request Hook':
      writeJsonFile(getFilePath('config.json'), config)
      .then(() => synchronizeGitLabPullRequest(payload))
      .then(build => startBuild(build))
      .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
      .catch(err => {
        console.error(err);
        res.status(400).json({ error: err });
      });
      break;
    case 'Tag Push Hook':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'Pipeline Hook':
      res.status(200).json({ msg: 'ok' });
      break;
    default:
      break;
  }
});

webhooks.post('/gogs', (req: express.Request, res: express.Response) => {
  let config: any = getConfig();
  const headers = req.headers;
  const payload = req.body;

  const ev = headers['x-gogs-event'] as string;
  const sig = headers['x-gogs-signature'] as string;
  const id = headers['x-gogs-delivery'] as string;

  if (!sig) {
    return res.status(400).json({ error: 'No X-Gogs-Signature found on request' });
  }

  if (!ev) {
    return res.status(400).json({ error: 'No X-Gogs-Event found on request' });
  }

  if (!id) {
    return res.status(400).json({ error: 'No X-Gogs-Delivery found on request' });
  }

  if (!verifyGogsWebhook(sig, payload, config.secret)) {
    return res.status(400).json({ error: 'X-Gogs-Signature does not match blob signature' });
  }

  if (req.secure) {
    config.url = 'https://' + req.headers.host;
  } else {
    config.url = 'http://' + req.headers.host;
  }

  switch (ev) {
    case 'push':
      writeJsonFile(getFilePath('config.json'), config)
      .then(() => pingGogsRepository(payload))
      .then(repo => {
        const buildData = {
          data: payload,
          start_time: new Date(),
          repositories_id: repo.id
        };

        return startBuild(buildData);
      })
      .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
      .catch(err => {
        console.error(err);
        res.status(400).json({ error: err });
      });
      break;
    case 'create':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'delete':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'fork':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'issues':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'issue_comment':
      res.status(200).json({ msg: 'ok' });
      break;
    case 'release':
      res.status(200).json({ msg: 'ok' });
    case 'pull_request':
      switch (payload.action) {
        case 'opened':
          writeJsonFile(getFilePath('config.json'), config)
          .then(() => createGogsPullRequest(payload))
          .then(build => startBuild(build))
          .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
          .catch(err => {
            console.error(err);
            res.status(400).json({ error: err });
          });
          break;
        case 'closed':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'reopened':
          writeJsonFile(getFilePath('config.json'), config)
          .then(() => synchronizeGogsPullRequest(payload))
          .then(build => startBuild(build))
          .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
          .catch(err => {
            console.error(err);
            res.status(400).json({ error: err });
          });
          break;
        case 'label_updated':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'milestoned':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'assigned':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'unassigned':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'demilestoned':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'label_cleared':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'edited':
          res.status(200).json({ msg: 'ok' });
          break;
        case 'synchronized':
          writeJsonFile(getFilePath('config.json'), config)
          .then(() => synchronizeGogsPullRequest(payload))
          .then(build => startBuild(build))
          .then(buildData => res.status(200).json({ msg: 'ok', data: buildData }))
          .catch(err => {
            console.error(err);
            res.status(400).json({ error: err });
          });
          break;
        default:
          break;
      }
    default:
    break;
  }
});

function verifyGithubWebhook(signature: string, payload: any, secret: string): boolean {
  const computedSig =
    `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(payload)).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSig));
}

function verifyGogsWebhook(signature: string, payload: any, secret: string): boolean {
  const computedSig =
    `${crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSig));
}
