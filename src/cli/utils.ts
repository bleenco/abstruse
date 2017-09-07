import * as request from 'request';

export function getHttpJsonResponse(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      headers: {
        'User-Agent': 'request'
      }
    };

    request(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}
