import { request, headerPullRequestCreated } from '../../../webhooks/bitbucket/PullRequestEvent';
import { sendBitBucketRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendBitBucketRequest(request, headerPullRequestCreated))
    .then(resp => resp.msg === 'ok' ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
