import { request, headerPullRequestCreated } from '../../../webhooks/bitbucket/PullRequestEvent';
import { sendBitBucketRequest } from '../../../utils/utils';
import { stopBuild, delay } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendBitBucketRequest(request, headerPullRequestCreated))
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
