import * as request from 'request';
import { subDays } from 'date-fns';

export default function() {
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        let dateFrom = subDays(new Date(), 7);
        let dateTo = new Date();
        let options = {
          url: `http://localhost:6500/api/stats/job-runs/${dateFrom}/${dateTo}`,
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
