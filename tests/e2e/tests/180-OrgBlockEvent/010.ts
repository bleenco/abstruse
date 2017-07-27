import { request, header } from '../../webhooks/OrgBlockEvent';
import { sendRequest } from '../../utils/utils';
import * from 'http';

export default function() {
  return Promise.resolve()
    .then(() => sendRequest(request, header))
    .then(parsedBody => {
      // console.log(parsedBody);
      return Promise.resolve();
    })
    .catch(err => {
      // console.log(err);
      return Promise.reject(err);
    });
}
