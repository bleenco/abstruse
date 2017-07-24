import * as express from 'express';
import * as crypto from 'crypto';
import { getConfig } from './utils';
import { pingRepository, createPullRequest } from './db/repository';
import { startBuild } from './process-manager';

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

  if (ev === 'ping') {
    const data = {
      html_url: payload.repository.html_url,
      description: payload.repository.description,
      github_id: payload.repository.id,
      name: payload.repository.name,
      full_name: payload.repository.full_name,
      private: payload.repository.private,
      is_fork: payload.repository.fork,
      default_branch: payload.repository.default_branch
    };

    pingRepository(data)
      .then(repo => res.status(200).json({ msg: 'ok' }))
      .catch(err => res.status(400).json(err));
  } else if (ev === 'pull_request') {
    switch (payload.action) {
      case 'opened':
        createPullRequest(payload.pull_request)
          .then(build => startBuild(build))
          .then(() => res.status(200).json({ msg: 'ok' }))
          .catch(err => console.error(err));
      break;
    }
  }
});

function verifyGithubWebhook(signature: string, payload: any, secret: string): boolean {
  const computedSig =
    `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(payload)).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSig));
}
