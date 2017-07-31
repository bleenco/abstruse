import { request, header } from '../../../webhooks/github/PingEvent';
import { sendRequest } from '../../../utils/utils';

export default function() {
  return Promise.resolve()
    .then(() => sendRequest(request, header))
    .then(parsedBody => Promise.resolve())
    .catch(err => Promise.reject(err));
}
