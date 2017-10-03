import * as request from 'request';

export default function() {
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        let options = {
          url: 'http://localhost:6500/api/repositories/trigger-test-build/1',
          method: 'GET',
          json: { test: 1 }
        };

        request(options, (err, response, body) => {
          if (err) {
            Promise.reject(err);
          } else {
            if (response.statusCode === 401 && response.body.data === 'Not Authorized') {
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
    });
}
