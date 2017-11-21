import { request, header } from '../../../webhooks/bitbucket/PushEvent';
import { sendBitBucketRequest } from '../../../utils/utils';
import { stopBuild } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendBitBucketRequest(request, header))
    .then(resp => resp.msg === 'ok' ? stopBuild(resp.data.buildId) : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
