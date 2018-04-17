import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { join } from 'path';
import { generateJobsAndEnv, Repository,
  Config, parseConfig, JobStage, CommandType } from '../../src/api/config';
import * as temp from 'temp';
import { Headers } from '@angular/http';
import { abstruse, killAllProcesses } from '../e2e/utils/process';
import { getImages, ImageData, deleteImage } from '../../src/api/image-builder';
import { sendGetRequest, sendRequest } from '../helpers/utils';
import * as dockerode from 'dockerode';
import { delay } from '../helpers/utils';
import * as fs from 'fs-extra';

chai.use(chaiAsPromised);
const expect = chai.expect;
let tempRoot = null;

describe('Docker Images', () => {
  before(function() {
    return Promise.resolve()
      .then(() => process.chdir(join(__dirname, '../')))
      .then(() => {
        tempRoot = temp.mkdirSync('abstruse-unit');
        console.log(`Using "${tempRoot}" as temporary directory for Docker images unit tests.`);
      })
      .then(() => abstruse(tempRoot, true))
      .then(() => fs.removeSync(join(tempRoot, 'abstruse/abstruse.sqlite')))
      .then(() => {
        return fs.copySync(
          join(__dirname, 'db/abstruse.sqlite'),
          join(tempRoot, 'abstruse/abstruse.sqlite'));
      })
      .then(() => killAllProcesses())
      .then(() => abstruse(tempRoot, false));
  });

  after(() => killAllProcesses());

  it('Should list all docker images', () => {
    return sendGetRequest({}, `api/images`).then(imgs => expect(imgs['data']).to.deep.equals([]));
  });

  it('Should send create base image request and then list all docker images', () => {
    return sendRequest({}, `api/images/build-base`)
      .then(status => expect(status['data']).to.equal(true))
      .then(() => delay(10000))
      .then(() => sendGetRequest({}, `api/images`))
      .then(imgs => {
        expect(imgs['data'].length).to.equals(1);
        expect(imgs['data'][0]['name']).to.equals('abstruse_builder');
      });
  });

  it('Should build test image from base image and then list it', () => {
    const img: ImageData = {
      name: 'test-unit-custom-image',
      dockerfile: 'FROM abstruse_builder',
      initsh: '',
      base: false };

      return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
      .then(jwt => {
        let headers = {
          'abstruse-ci-token': String(jwt['data'])
        };

        return sendRequest(img, `api/images/build`, headers)
          .then(status => expect(status['data']).to.equal(true))
          .then(() => delay(10000))
          .then(() => sendGetRequest({}, `api/images`))
          .then(imgs => {
            expect(imgs['data'].length).to.equals(2);
            expect(imgs['data'][0]['name']).to.equals('test-unit-custom-image');
            expect(imgs['data'][1]['name']).to.equals('abstruse_builder');
          });
      });
  });

  it(`should delete that last created image and check that it's deleted everywhere`, () => {
    const del: ImageData = {
      name: 'test-unit-custom-image',
      dockerfile: '',
      initsh: '',
      base: false };
    const docker = new dockerode();

    return sendRequest({email: 'john@gmail.com', password: 'test123'}, 'api/user/login')
    .then(jwt => {
      let headers = {
        'abstruse-ci-token': String(jwt['data'])
      };

      return sendRequest(del, `api/images/delete`, headers)
        .then(status => expect(status['data']).to.equal(true))
        .then(() => delay(1000))
        .then(() => sendGetRequest({}, `api/images`))
        .then(imgs => {
          expect(imgs['data'].length).to.equals(1);
          expect(imgs['data'][0]['name']).to.equals('abstruse_builder');
        })
        .then(() => docker.listImages())
        .then(imgs => {
          if (imgs) {
            imgs = imgs.filter(i => {
              return i.RepoTags && i.RepoTags.findIndex(rt => rt === del.name) !== -1;
            });
            expect(imgs.length).to.equals(0);
          }
        })
        .then(() => fs.readdir(join(tempRoot, 'abstruse/images')))
        .then(dirs => expect(dirs).to.deep.equals([]))
        .then(() => fs.readdir(join(tempRoot, 'abstruse/base-images')))
        .then(dirs => expect(dirs).to.deep.equals(['abstruse_builder']));
    });
  });
});
