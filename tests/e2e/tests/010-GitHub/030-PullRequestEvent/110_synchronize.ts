import { synchronize, header } from '../../../webhooks/github/PullRequestEvent';
import { sendGitHubRequest } from '../../../utils/utils';
import { stopBuild, delay } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGitHubRequest(synchronize, header))
    .then(resp => {
      if (resp.msg === 'ok') {
        return delay(3000)
          .then(() => stopBuild(resp.data.buildId));
      } else {
        Promise.reject(resp);
      }
    })
    .catch(err => Promise.reject(err));
}
