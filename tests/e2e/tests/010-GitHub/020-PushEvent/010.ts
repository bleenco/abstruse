import { request, header } from '../../../webhooks/github/PushEvent';
import { sendGitHubRequest } from '../../../utils/utils';
import { stopBuild } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGitHubRequest(request, header))
    .then(resp => resp.msg === 'ok' ? stopBuild(resp.data.buildId) : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
