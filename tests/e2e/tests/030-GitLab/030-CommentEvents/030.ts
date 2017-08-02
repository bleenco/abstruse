import { requestIssueComment, header } from '../../../webhooks/gitlab/CommentEvents';
import { sendGitLabRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendGitLabRequest(requestIssueComment, header))
    .then(resp => resp.msg === 'ok' ? Promise.resolve() : Promise.reject(resp))
    .catch(err => Promise.reject(err));
}
