import * as crypto from 'crypto';
import * as request from 'request';

export function sendRequest(data: any, headers: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let secret = 'thisIsSecret';  // todo, read that from config
    let sig = crypto.createHmac('sha1', secret).update(JSON.stringify(data)).digest('hex');
    headers['X-Hub-Signature'] = `sha1=${sig}`;

    let options = {
      url: 'http://localhost:6500/webhooks/github',
      method: 'POST',
      headers: headers,
      json: data
    };

    request(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        if (response.statusCode === 200) {
          resolve(body);
        } else {
          reject({
            statusCode: response.statusCode,
            response: body
          });
        }
      }
    });
  });
}
