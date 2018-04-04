import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { join } from 'path';
import * as temp from 'temp';
import { Headers } from '@angular/http';
import { execSilent, exec, abstruse, killAllProcesses } from '../e2e/utils/process';
import { sendGetRequest, sendRequest } from '../helpers/utils';
import { subDays } from 'date-fns';

chai.use(chaiAsPromised);
const expect = chai.expect;
let tempRoot = null;

describe('Api Server Routes Unit Tests', () => {

  before(function() {
    return Promise.resolve()
      .then(() => process.chdir(join(__dirname, '../')))
      .then(() => {
        tempRoot = temp.mkdirSync('abstruse-unit');
        console.log(`Using "${tempRoot}" as temporary directory for server API routes units tests.`);
      })
      .then(() => abstruse(tempRoot, false));
  });

  after(() => killAllProcesses());

  describe('User Routes', () => {
    it(`create user should return success`, () => {
      let registerData = {
        email: 'test@gmail.com', fullname: 'test',
        password: 'test', confirmPassword: 'test', admin: 1
      };

      return sendRequest(registerData, 'api/user/create').then(res => {
        expect(res).to.deep.equal({ status: true });
      });
    });

    it(`create user should return unauthorized error`, () => {
      let registerData = {
        email: 'test2@gmail.com', fullname: 'test2',
        password: 'test', confirmPassword: 'test', admin: 0
      };

      return sendRequest(registerData, 'api/user/create').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`create user should return success`, () => {
      let registerData = {
        email: 'test2@gmail.com', fullname: 'test2',
        password: 'test', confirmPassword: 'test', admin: 0
      };

      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
      .then(jwt => {
        let headers = {
          'abstruse-ci-token': String(jwt['data'])
        };

        return sendRequest(registerData, 'api/user/create', headers).then(res => {
          expect(res).to.deep.equal({ status: true });
        });
      });
    });

    it(`get users should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/user/').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
   });

    it(`get users should return two user`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/user/', headers).then(res => {
            expect(res['data'][0]['fullname']).to.equals('test');
            expect(res['data'][1]['fullname']).to.equals('test2');
          });
        });
    });

    it(`login should return jwt token`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          expect(jwt).haveOwnProperty('data');
        });
    });

    it(`update user should return unauthorized error`, () => {
      let registerData = {
        email: 'test@gmail.com', fullname: 'test2', password: 'test', confirmPassword: 'test'
      };

      return sendRequest(registerData, 'api/user/save').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`update user should return success`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = { 'abstruse-ci-token': String(jwt['data']) };
          let registerData = { id: 1, fullname: 'test' };

          return sendRequest(registerData, 'api/user/save', headers).then(res => {
            expect(res).to.deep.equal({ data: true });
          });
        });
    });

    it(`update password should return unauthorized error`, () => {
      let registerData = {
        email: 'test@gmail.com', fullname: 'test2', password: 'test123', confirmPassword: 'test123'
      };

      return sendRequest(registerData, 'api/user/update-password').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`update password should return success`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = { 'abstruse-ci-token': String(jwt['data']) };
          let registerData = {
            id: 1,
            email: 'test@gmail.com',
            fullname: 'test',
            password: 'test'
          };

          return sendRequest(registerData, 'api/user/update-password', headers).then(res => {
            expect(res).to.deep.equal({ data: true });
          });
        });
    });

    it(`get user should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/user/1').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`get user should return success`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/user/1', headers).then(res => {
            expect(res['data']['fullname']).to.equals('test');
          });
        });
    });

    it(`insert token should return unauthorized error`, () => {
      let token = { description: 'test', token: '13fw5waf', users_id: 1 };

      return sendRequest(token, 'api/user/add-token').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`insert token should return success`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = { 'abstruse-ci-token': String(jwt['data']) };
          let token = { description: 'test', token: '13fw5waf', users_id: 1 };

          return sendRequest(token, 'api/user/add-token', headers).then(res => {
            expect(res).to.deep.equal({ data: true });
          });
        });
    });

    it(`upload avatar should return error`, () => {
      return sendRequest({}, 'api/user/upload-avatar').catch(err => {
        expect(err).to.not.be.a('null');
      });
    });
  });

  describe('Repository Routes', () => {
    it(`get repositories should return empty array`, () => {
      return sendGetRequest({}, 'api/repositories/').then(repo => {
        expect(repo).to.deep.equal({ data: [] });
      });
    });

    it(`get user repositories should return empty array`, () => {
      return sendGetRequest({}, 'api/repositories/1').then(repo => {
        expect(repo).to.deep.equal({ data: [] });
      });
    });

    it(`get repository should return false`, () => {
      return sendGetRequest({}, 'api/repositories/id/1/1').then(repo => {
        expect(repo).to.deep.equal({ status: false });
      });
    });

    it(`get repository should return false`, () => {
      return sendGetRequest({}, 'api/repositories/id/1').then(repo => {
        expect(repo).to.deep.equal({ status: false });
      });
    });

    it(`get repository builds should return empty array`, () => {
      return sendGetRequest({}, 'api/repositories/1/builds/0/5').then(repo => {
        expect(repo).to.deep.equal({ data: [] });
      });
    });

    it(`check repository should return error`, () => {
      return sendGetRequest({}, 'api/repositories/check/1').then(repo => {
        expect(repo).to.deep.equal({ err: null });
      });
    });

    it(`trigger test-build should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/repositories/trigger-test-build/1').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`trigger test-build should return false`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/repositories/trigger-test-build/1', headers).then(res => {
            expect(res).to.deep.equal({ data: false });
          });
        });
    });

    it(`get config file should return false`, () => {
      return sendGetRequest({}, 'api/repositories/get-config-file/1').then(repo => {
        expect(repo).to.deep.equal({ data: false });
      });
    });

    it(`get cache should return error`, () => {
      return sendGetRequest({}, 'api/repositories/get-cache/1').then(repo => {
        expect(repo).to.deep.equal({ err: null });
      });
    });

    it(`delete cache should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/repositories/delete-cache/1').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`delete cache should return false`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/repositories/delete-cache/1', headers).then(res => {
            expect(res).to.deep.equal({ data: false });
          });
        });
    });
  });

  describe('Build Routes', () => {
    it(`get builds should return empty array`, () => {
      return sendGetRequest({}, `api/builds/limit/5/offset/0/''/`).then(res => {
        expect(res).to.deep.equal({ data: [] });
      });
    });

    it(`get build should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/builds/1').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`get build should return empty object`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/builds/1', headers).then(res => {
            expect(res).to.deep.equal({});
          });
        });
    });
  });

  describe('Job Route', () => {
    it(`get job should return unauthorized error`, () => {
      return sendGetRequest({}, `api/jobs/1`).catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`get job should return empty object`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, `api/jobs/1`, headers).then(res => {
            expect(res).to.deep.equal({});
          });
        });
    });
  });

  describe('Token Route', () => {
    it(`get tokens should return unauthorized error`, () => {
      return sendGetRequest({}, `api/tokens`).catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`get tokens should return return token`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, `api/tokens`, headers).then(res => {
            expect(res['data'][0]['description']).to.equals('test');
            expect(res['data'][0]['users_id']).to.equal(1);
            expect(res['data'][0]['id']).to.equal(1);
          });
        });
    });
  });

  describe('Badge Routes', () => {
    it(`get badge should return badge html`, () => {
      return sendGetRequest({}, `badge/1`).then(res => {
        expect(res).to.include('<svg');
      });
    });

    it(`get badge should return error`, () => {
      return sendGetRequest({}, `badge/Izak88/bterm`)
      .then(res => expect(res).to.deep.equal({ status: false }));
    });
  });

  describe('Setup Routes', () => {
    it(`ready should return true`, () => {
      return sendGetRequest({}, `api/setup/ready`).then(res => {
        expect(res).to.deep.equal({ data: true });
      });
    });

    it(`db should return true`, () => {
      return sendGetRequest({}, `api/setup/db`).then(res => {
        expect(res).to.deep.equal({ data: true });
      });
    });

    it(`status should return true`, () => {
      return sendGetRequest({}, `api/setup/status`).then(res => {
        expect(res).to.deep.equal({
          data: { docker: true, dockerRunning: true, sqlite: true, git: true }
        });
      });
    });

    it(`docker-image should return true`, () => {
      return sendGetRequest({}, `api/setup/docker-image`).then(res => {
        expect(res).to.deep.equal({ data: true });
      });
    });

    it(`login-required should return false`, () => {
      return sendGetRequest({}, `api/setup/login-required`).then(res => {
        expect(res).to.deep.equal({ data: false });
      });
    });

    it(`db init should return true`, () => {
      return sendRequest({}, `api/setup/db/init`).catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });
  });

  describe('Permission Routes', () => {
    it(`get repository permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/repository/1/user`).then(res => {
        expect(res).to.deep.equal({ status: false });
      });
    });

    it(`get repository user permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/repository/1/user/1`).then(res => {
        expect(res).to.deep.equal({ status: false });
      });
    });

    it(`get builds permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/build/1/user/1`).then(res => {
        expect(res).to.deep.equal({ data: false });
      });
    });

    it(`get job permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/job/1/user/1`).then(res => {
        expect(res).to.deep.equal({ data: false });
      });
    });
  });

  describe('Environment Variable Routes', () => {
    it(`add variable should return unauthorized error`, () => {
      return sendRequest({}, 'api/variables/add').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`add variable should return true`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };
          let variable = {
            repositories_id: 1,
            name: 'test',
            value: 'test',
            encrypted: 1
          };

          return sendRequest(variable, 'api/variables/add', headers).then(res => {
            expect(res).to.deep.equal({ data: true });
          });
        });
    });

    it(`remove variable should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/variables/remove/1').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`remove variable should return true`, () => {
      return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/variables/remove/1', headers).then(res => {
            expect(res).to.deep.equal({ data: true });
          });
        });
    });
  });

  describe('Stats Routes', () => {
    it(`get job-runs should return data`, () => {
      return sendGetRequest({}, `api/stats/job-runs`).then(res => {
        expect(res).haveOwnProperty('data');
      });
    });

    it(`get job-runs should return data`, () => {
      const dateFrom = subDays(new Date(), 7);
      const dateTo = new Date();

      return sendGetRequest({}, `api/stats/job-runs/${dateFrom}/${dateTo}`).then(res => {
        expect(res).haveOwnProperty('data');
      });
    });
  });

  describe('Logs Route', () => {
    it(`get logs should return logs`, () => {
      return sendGetRequest({}, `api/logs/5/0/all`).then(res => {
        expect(res).haveOwnProperty('data');
      });
    });
  });

  describe('Keys Route', () => {
    it(`get key should return the key`, () => {
      return sendGetRequest({}, `api/keys/public`).then(res => {
        expect(res['key']).to.include('---BEGIN PUBLIC KEY---');
      });
    });
  });

  describe('Images Route', () => {
    it(`get images should return images data`, () => {
      return sendGetRequest({}, `api/images`).then(res => {
        expect(res).haveOwnProperty('data');
      });
    });
  });

});
