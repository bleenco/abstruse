import { request, header } from '../../../webhooks/gogs/PushEvents';
import { sendGogsRequest } from '../../../utils/utils';
import { stopBuild, delay } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGogsRequest(request, header))
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
