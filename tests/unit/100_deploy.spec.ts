import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { findFromEnvVariables, deploy } from '../../src/api/deploy';
import { s3Deploy } from '../../src/api/deploy/aws-s3';
import { codeDeploy } from '../../src/api/deploy/aws-code-deploy';
import { elasticDeploy } from '../../src/api/deploy/aws-elastic';
import { join } from 'path';
import * as temp from 'temp';
import { abstruse, killAllProcesses } from '../e2e/utils/process';
import { ImageData } from '../../src/api/image-builder';
import { createContainer, killContainer } from '../../src/api/docker';
import * as utils from '../../src/api/utils';
import { sendGetRequest, sendRequest } from '../helpers/utils';
import * as dockerode from 'dockerode';
import { delay } from '../helpers/utils';
import * as fs from 'fs-extra';
import { CommandType } from '../../src/api/config';

chai.use(chaiAsPromised);
const expect = chai.expect;
let tempRoot = null;

describe('Deploying with AWS Services', () => {
  before(function() {
    return Promise.resolve()
      .then(() => process.chdir(join(__dirname, '../')))
      .then(() => {
        tempRoot = temp.mkdirSync('abstruse-unit');
        console.log(`Using "${tempRoot}" as temporary directory for e2e protractor tests.`);
      })
      .then(() => abstruse(tempRoot, true))
      .then(() => fs.removeSync(join(tempRoot, 'abstruse/abstruse.sqlite')))
      .then(() => {
        return fs.copySync(
          join(__dirname, 'db/abstruse.sqlite'),
          join(tempRoot, 'abstruse/abstruse.sqlite'));
      })
      .then(() => killAllProcesses())
      .then(() => abstruse(tempRoot, true))
      .then(() => sendRequest({}, `api/images/build-base`))
      .then(status => expect(status['data']).to.equal(true))
      .then(() => {
        return createContainer('unit_test_abstruse_container', 'abstruse_builder', []).toPromise();
      });
  });

  after(() => {
    return killContainer('unit_test_abstruse_container')
      .then(() => killAllProcesses());
  });

  it(`should return null when there is no variables`, () => {
    let result = findFromEnvVariables({}, '');
    expect(result).to.equals(null);
  });

  it(`should return null when variables doesn't exists`, () => {
    let result =
      findFromEnvVariables({'secretAccessKey': { value: '1feges2', secure: false }}, 'accessKey');
    expect(result).to.equals(null);
  });

  it(`should return value when variable exists`, () => {
    let result =
      findFromEnvVariables({'accessKey': { value: '1feges2', secure: false }}, 'accessKey');
    expect(result).to.equals('1feges2');
  });

  it(`should return unsupported provider on calling deploy on azure`, () => {
    let preferences = { provider: 'azure' };

    return deploy(preferences, 'unit_test_abstruse_container', {})
      .subscribe(status => {},
      err => {
        expect(err).to.deep.equals({
          type: 'containerError',
          data: 'Deployment provider azure is not supported.'
        });
      },
      () => Promise.reject(1));
  });

  it(`should return error on calling deploy with s3 provider but insufficent data`, () => {
    let preferences = { provider: 's3', bucket: 'test' };
    let outputs = [];

    return deploy(preferences, 'unit_test_abstruse_container', {})
      .subscribe(status => {
        outputs.push(status);
      },
      err => {
        expect(outputs.length).to.equals(3);
        expect(outputs[0].data).to.includes('accessKeyId is not set in environment variables or');
        expect(outputs[1].data).to.includes('secretAccessKey is not set in environment variables ');
        expect(outputs[2].data).to.includes('region is not set in environment variables or');
      },
      () => false);
  });

  it(`should return error on calling s3 deploy without region data`, () => {
    let preferences = { provider: 's3', bucket: 'test' };
    let variables = {
      'accessKeyId': { value: '2fwfwa21gmoescfge', secure: false },
      'secretAccessKey': { value: 'test', secure: false }
    };
    let outputs = [];

    return s3Deploy(preferences, 'unit_test_abstruse_container', variables)
      .subscribe(status => {
        outputs.push(status);
      },
      err => {
        expect(outputs.length).to.equals(1);
        expect(outputs[0].data).to.includes('region is not set in environment variables or');
      },
      () => false);
  });

  it(`should return error on calling awsCodeDeploy without region and deploymentGroup data`, () => {
    let preferences = { provider: 'codeDeploy', application: 'test' };
    let variables = {
      'accessKeyId': { value: '2fwfwa21gmoescfge', secure: false },
      'secretAccessKey': { value: 'test', secure: false }
    };
    let outputs = [];

    return codeDeploy(preferences, 'unit_test_abstruse_container', variables)
      .subscribe(status => {
        outputs.push(status);
      },
      err => {
        expect(outputs.length).to.equals(2);
        expect(outputs[0].data).to.includes('deploymentGroup is not set in yml config file');
        expect(outputs[1].data).to.includes('region is not set in environment variables or');
      },
      () => false);
  });

  it(`should return error on calling awsElastic without application and environment data`, () => {
    let preferences = { provider: 'elastic' };
    let variables = {
      'accessKeyId': { value: '2fwfwa21gmoescfge', secure: true },
      'secretAccessKey': { value: 'test', secure: false },
      'region': { value: 'test', secure: false }
    };
    let outputs = [];

    return elasticDeploy(preferences, 'unit_test_abstruse_container', variables)
      .subscribe(status => {
        outputs.push(status);
      },
      err => {
        expect(outputs.length).to.equals(2);
        expect(outputs[0].data).to.includes('application is not set in yml config file');
        expect(outputs[1].data).to.includes('environmentName is not set in yml config file');
      },
      () => false);
  });
});
