import * as request from 'request';

export default function() {
  return Promise.resolve()
    .then(() => {
      return new Promise((resolve, reject) => {
        let options = {
          url: 'http://localhost:6500/api/repositories/id/1/1',
          method: 'GET',
          json: { test: 1 }
        };

        request(options, (err, response, body) => {
          if (err) {
            Promise.reject(err);
          } else {
            if (response.statusCode === 200) {
              const repo = body;
              if (repo.data.variables && repo.data.variables.length === 1) {
                resolve(repo);
              } else {
                reject({
                  statusCode: response.statusCode,
                  response: body
                });
              }
            } else {
              reject({
                statusCode: response.statusCode,
                response: body
              });
            }
          }
        });
      });
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        let options = {
          url: 'http://localhost:6500/api/user/login',
          method: 'POST',
          json: { email: 'test@gmail.com', password: 'test' }
        };

        return request(options, (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            if (response.statusCode === 200) {
              resolve(response.body);
            } else {
              reject({
                statusCode: response.statusCode,
                response: body
              });
            }
          }
        });
      });
    })
    .then(token => {
      return new Promise((resolve, reject) => {
        let options = {
          url: 'http://localhost:6500/api/variables/add',
          method: 'POST',
          json: { name: 'token', value: 'mysecrettoken', repositories_id: 1, encrypted: true },
          headers: { 'abstruse-ci-token': token['data'] }
        };

        return request(options, (err, response, body) => {
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
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        let options = {
          url: 'http://localhost:6500/api/repositories/id/1/1',
          method: 'GET',
          json: { test: 1 }
        };

        return request(options, (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            if (response.statusCode === 200) {
              const repo = body;
              if (repo.data && repo.data.variables
                && repo.data.variables.length === 2
                && repo.data.variables[0].name === 'test'
                && repo.data.variables[1].name === 'token'
                && repo.data.variables[1].value !== 'mysecrettoken'
                && repo.data.variables[1].repositories_id === 1
                && repo.data.variables[1].encrypted
              ) {
                resolve(body);
              } else {
                reject({
                  statusCode: response.statusCode,
                  response: body
                });
              }
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
