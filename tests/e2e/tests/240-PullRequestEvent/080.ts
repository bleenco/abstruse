import { requestLabeled, header } from '../../webhooks/PullRequestEvent';
import { sendRequest } from '../../utils/utils';
import * from 'http';

export default function() {
  return Promise.resolve()
    .then(() => sendRequest(requestLabeled, header))
    .then(parsedBody => {
      // console.log(parsedBody);
      return Promise.resolve();
    })
    .catch(err => {
      // console.log(err);
      return Promise.reject(err);
    });
}
