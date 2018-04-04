import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { join } from 'path';
import * as temp from 'temp';
import { Headers } from '@angular/http';
import { execSilent, exec, abstruse, killAllProcesses } from '../e2e/utils/process';
import { sendGetRequest, sendRequest } from '../helpers/utils';
import { subDays } from 'date-fns';
import * as fs from 'fs-extra';

chai.use(chaiAsPromised);
const expect = chai.expect;
let tempRoot = null;

describe('Api Server Routes Unit Tests', () => {
  before(function() {
    this.timeout(300000);

    return Promise.resolve()
      .then(() => process.chdir(join(__dirname, '../')))
      .then(() => {
        tempRoot = temp.mkdirSync('abstruse-unit');
        console.log(`Using "${tempRoot}" as temporary directory for API routes unit tests.`);
      })
      .then(() => abstruse(tempRoot, false))
      .then(() => fs.removeSync(join(tempRoot, '/.abstruse/abstruse.sqlite')))
      .then(() => {
        return fs.copySync(
          join(__dirname, '/db/abstruse.sqlite'),
          join(tempRoot, '/.abstruse/abstruse.sqlite'));
      })
      .then(() => killAllProcesses())
      .then(() => abstruse(tempRoot, false));
  });

  after(() => killAllProcesses());

  describe('Repository Routes', () => {
    it(`get repositories should return empty array`, () => {
      return sendGetRequest({}, `api/repositories?keyword=`).then(repo => {
        expect(repo['data'][0]['full_name']).to.equal('Izak88/bterm');
        expect(repo['data'][0]['id']).to.equal(1);
        expect(repo['data'][1]['full_name']).to.equal('izak88/d3-bundle');
        expect(repo['data'][1]['id']).to.equal(5);
        expect(repo['data'].length).to.equal(2);
      });
    });

    it(`get repositories should return empty array`, () => {
      return sendGetRequest({}, `api/repositories/1?keyword=`).then(repo => {
        expect(repo['data'][0]['full_name']).to.equal('Izak88/bterm');
        expect(repo['data'][0]['id']).to.equal(1);
        expect(repo['data'][1]['full_name']).to.equal('jkuri/d3-bundle');
        expect(repo['data'][1]['id']).to.equal(2);
        expect(repo['data'].length).to.equal(5);
      });
    });

    it(`get repositories should return empty array`, () => {
      return sendGetRequest({}, `api/repositories/2?keyword=`).then(repo => {
        expect(repo['data'][0]['full_name']).to.equal('Izak88/bterm');
        expect(repo['data'][0]['id']).to.equal(1);
        expect(repo['data'][1]['full_name']).to.equal('izak88/d3-bundle');
        expect(repo['data'][1]['id']).to.equal(5);
        expect(repo['data'].length).to.equal(2);
      });
    });

    it(`get repository should return repository data`, () => {
      return sendGetRequest({}, 'api/repositories/id/2').then(repo => {
        expect(repo['data']['full_name']).to.deep.equal('jkuri/d3-bundle');
        expect(repo['data']['hasPermission']).to.equal(false);
      });
    });

    it(`get repository should return repository data`, () => {
      return sendGetRequest({}, 'api/repositories/id/2/1').then(repo => {
        expect(repo['data']['hasPermission']).to.equal(true);
        expect(repo['data']['full_name']).to.deep.equal('jkuri/d3-bundle');
      });
    });

    it(`get repository should return false`, () => {
      return sendGetRequest({}, 'api/repositories/id/2/2').then(repo => {
        expect(repo['data']['hasPermission']).to.equal(false);
      });
    });

    it(`get repository builds should return array with builds`, () => {
      return sendGetRequest({}, 'api/repositories/2/builds/5/0').then(repo => {
        expect(repo['data'][0]['id']).to.equal(7);
        expect(repo['data'][0]['branch']).to.equal('master');
        expect(repo['data'][4]['id']).to.equal(3);
        expect(repo['data'][4]['branch']).to.equal('master');
      });
    });

    it(`check repository should return data`, () => {
      return sendGetRequest({}, 'api/repositories/check/1').then(repo => {
        expect(repo['data']['config']).to.equal(true);
      });
    });

    it(`trigger test-build should return unauthorized error`, () => {
      return sendGetRequest({}, 'api/repositories/trigger-test-build/1').catch(err => {
        expect(err).to.deep.equal({ response: { data: 'Not Authorized' }, statusCode: 401 });
      });
    });

    it(`trigger test-build should return false`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/repositories/trigger-test-build/1', headers).then(res => {
            expect(res).to.deep.equal({ data: false });
          });
        });
    });

    it(`get config file should return data`, () => {
      return sendGetRequest({}, 'api/repositories/get-config-file/1').then(repo => {
        expect(repo).haveOwnProperty('data');
      });
    });

    it(`get cache should return empty array`, () => {
      return sendGetRequest({}, 'api/repositories/get-cache/1').then(repo => {
        expect(repo).to.deep.equal({ data: [] });
      });
    });

    it(`delete cache should return true`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/repositories/delete-cache/1', headers).then(res => {
            expect(res).to.deep.equal({ data: true });
          });
        });
    });

    it(`get builds should return array`, () => {
      return sendGetRequest({}, `api/builds/limit/5/offset/0/''/`).then(res => {
        expect(res['data'][0]['id']).to.equal(13);
      });
    });

    it(`get builds should return array`, () => {
      return sendGetRequest({}, `api/builds/limit/5/offset/0/''/1`).then(res => {
        expect(res['data'][0]['id']).to.equal(13);
      });
    });

    it(`get builds should return array`, () => {
      return sendGetRequest({}, `api/builds/limit/5/offset/0/''/2`).then(res => {
        expect(res['data'][0]['id']).to.equal(13);
      });
    });

    it(`get build should return build object`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/builds/1', headers).then(res => {
            expect(res['data']['id']).to.equal(1);
          });
        });
    });

    it(`get build should return build object`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/builds/1/1', headers).then(res => {
            expect(res['data']['id']).to.equal(1);
          });
        });
    });

    it(`get build should return build object`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, 'api/builds/1/2', headers).then(res => {
            expect(res['data']['id']).to.equal(1);
          });
        });
    });

    it(`get job should return job object`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, `api/jobs/1`, headers).then(res => {
            expect(res['data']['id']).to.equal(1);
          });
        });
    });

    it(`get job should return job object`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, `api/jobs/1/1`, headers).then(res => {
            expect(res['data']['id']).to.equal(1);
          });
        });
    });

    it(`get job should return job object`, () => {
      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
        .then(jwt => {
          let headers = {
            'abstruse-ci-token': String(jwt['data'])
          };

          return sendGetRequest({}, `api/jobs/1/2`, headers).then(res => {
            expect(res['data']['id']).to.equal(1);
          });
        });
    });

    it(`get badge should return false`, () => {
      return sendGetRequest({}, `badge/Izak88/bterm`).then(res => {
        expect(res).to.include('<svg');
      });
    });

    it(`get repository permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/repository/2/user`).then(res => {
        expect(res).to.deep.equal({ data: 0 });
      });
    });

    it(`get repository user permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/repository/2/user/1`).then(res => {
        expect(res).to.deep.equal({ data: 1 });
      });
    });

    it(`get repository user permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/repository/2/user/2`).then(res => {
        expect(res).to.deep.equal({ data: 0 });
      });
    });

    it(`get builds permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/build/1/user`).then(res => {
        expect(res).to.deep.equal({ data: 0 });
      });
    });

    it(`get builds permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/build/1/user/1`).then(res => {
        expect(res).to.deep.equal({ data: 1 });
      });
    });

    it(`get builds permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/build/1/user/2`).then(res => {
        expect(res).to.deep.equal({ data: 0 });
      });
    });

    it(`get job permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/job/1/user`).then(res => {
        expect(res).to.deep.equal({ data: 0 });
      });
    });

    it(`get job permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/job/1/user/1`).then(res => {
        expect(res).to.deep.equal({ data: 1 });
      });
    });

    it(`get job permission should return false`, () => {
      return sendGetRequest({}, `api/permissions/job/1/user/2`).then(res => {
        expect(res).to.deep.equal({ data: 0 });
      });
    });

    it(`build base image should return true`, () => {
      return sendRequest({}, 'api/images/build-base').then(res => {
        expect(res).to.deep.equal({ data: true });
      });
    });
  });
});
