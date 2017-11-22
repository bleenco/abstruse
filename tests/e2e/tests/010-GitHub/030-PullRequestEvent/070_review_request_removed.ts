import { requestReviewRequestRemoved, header } from '../../../webhooks/github/PullRequestEvent';
import { sendGitHubRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGitHubRequest(requestReviewRequestRemoved, header))
    .then(resp => resp.msg === 'ok' ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
