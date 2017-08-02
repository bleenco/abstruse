import { request, header } from '../../../webhooks/github/MemberEvent';
import { sendGitHubRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGitHubRequest(request, header))
    .then(resp => resp.msg === 'ok' ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
