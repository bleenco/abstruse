import { request, header } from '../../webhooks/CommitCommentEvent';
import { sendRequest } from '../../utils/utils';
import * from 'http';

export default function() {
  return Promise.resolve()
    .then(() => sendRequest(request, header))
    .then(parsedBody => {
      return Promise.resolve();
    })
    .catch(err => {
      return Promise.reject(err);
    });
}
