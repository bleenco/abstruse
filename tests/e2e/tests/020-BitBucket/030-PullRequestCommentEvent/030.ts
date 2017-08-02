import { request, headerPullRequestCommentDeleted }
  from '../../../webhooks/bitbucket/PullRequestCommentEvent';
import { sendBitBucketRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendBitBucketRequest(request, headerPullRequestCommentDeleted))
    .then(resp => resp.msg === 'ok' ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
