import * as request from 'request';

export default function() {
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        let options = {
          url: 'http://localhost:6500/api/user/upload-avatar',
          method: 'POST'
        };

        request(options, (err, response, body) => {
          if (err) {
            Promise.reject(err);
          } else {
            if (response.statusCode === 500) {
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
