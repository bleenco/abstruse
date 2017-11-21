import { request, header } from '../../../webhooks/gogs/PushEvents';
import { sendGogsRequest } from '../../../utils/utils';
import { stopBuild } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGogsRequest(request, header))
    .then(resp => resp.msg === 'ok' ? stopBuild(resp.data.buildId) : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
