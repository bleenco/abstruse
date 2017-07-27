import * as crypto from 'crypto';

export function sendRequest(request, header) {
  let rp = require('request-promise');
  let secret = 'thisIsSecret';  // todo, read that from config
  header['X-Hub-Signature'] =
    `sha1=${crypto.createHmac('sha1', secret).update(JSON.stringify(request)).digest('hex')}`;
  return rp({
    method: 'POST',
    uri: 'http://localhost:6500/webhooks/github',
    json: true,
    body: request,
    headers: header,
  });
}
