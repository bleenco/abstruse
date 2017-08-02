import { request, header } from '../../../webhooks/gitlab/PipelineEvents';
import { sendGitLabRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGitLabRequest(request, header))
    .then(resp => resp.msg === 'ok' ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
