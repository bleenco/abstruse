import * as request from 'request';

export default function() {
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        let options = {
          url: 'http://localhost:6500/api/jobs/1/1',
          method: 'GET',
          json: { test: 1 }
        };

        request(options, (err, response, body) => {
          if (err) {
            Promise.reject(err);
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
    });
}
