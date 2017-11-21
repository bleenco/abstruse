import { pullRequestSynchronized, header } from '../../../webhooks/gogs/PullRequestEvents';
import { sendGogsRequest } from '../../../utils/utils';
import { stopBuild } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGogsRequest(pullRequestSynchronized, header))
    .then(resp => resp.msg === 'ok' ? stopBuild(resp.data.buildId) : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
