import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { join } from 'path';
import * as temp from 'temp';
import { Headers } from '@angular/http';
import { execSilent, exec, abstruse, killAllProcesses } from '../e2e/utils/process';
import { sendGetRequest, sendRequest } from '../helpers/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;
let tempRoot = null;

describe('Api Server Routes Unit Tests', () => {

  before(function() {
    this.timeout(300000);

    return Promise.resolve()
      .then(() => process.chdir(join(__dirname, '../')))
      /* .then((): any => execSilent('npm',  ['run', 'build:prod']))
      .then((): any => execSilent('npm', ['link'])) */
      .then(() => {
        tempRoot = temp.mkdirSync('abstruse-unit');
        console.log(`Using "${tempRoot}" as temporary directory for e2e protractor tests.`);
      })
      .then(() => abstruse(tempRoot, false));
  });

  after(() => killAllProcesses());

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
  });

  describe('User Routes', () => {
    it(`get users should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/user/').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
   });

   it(`create user should return success`, () => {
      let registerData = {
        email: 'test@gmail.com', fullname: 'test',
        password: 'test', confirmPassword: 'test', admin: 1
      };

      return sendRequest(registerData, 'api/user/create').then(res => {
        expect(res).to.deep.equal({ status: true });
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

    it(`update password should return unauthorized error`, () => {
      let registerData = {
        email: 'test@gmail.com', fullname: 'test2', password: 'test123', confirmPassword: 'test123'
      };

      return sendRequest(registerData, 'api/user/save').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`get user should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/user/1').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`insert token should return unauthorized error`, () => {
      let token = { description: 'test', token: '13fw5waf', users_id: 1 };

      return sendRequest(token, 'api/user/add-token').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`upload avatar should return error`, () => {
      return sendRequest({}, 'api/user/upload-avatar').catch(err => {
        expect(err).to.not.be.a('null');
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
  });

  xit(`delete cache should return false`, () => {
    return sendRequest({email: 'test@gmail.com', password: 'test'}, 'api/user/login').then(jwt => {
      /* let headers = new Headers({ 'Content-Type': 'text/plain' }); */
      let headers = new Headers();
      if (jwt) {
        headers.append('abstruse-ci-token', String(jwt));
      }

      let token = { 'abstruse-ci-token': String(jwt), test: 213, test2: '21' };
      return sendGetRequest(token, 'api/repositories/delete-cache/1', headers)
        .then(cache => {
          expect(cache).to.deep.equal({ status: false });
        });
    });
  });
});
