import { request, headerPullRequestApproved }
  from '../../../webhooks/bitbucket/PullRequestApprovalEvent';
import { sendBitBucketRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendBitBucketRequest(request, headerPullRequestApproved))
    .then(resp => resp.msg === 'ok' ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
