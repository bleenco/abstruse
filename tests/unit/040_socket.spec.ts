import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { join } from 'path';
import * as temp from 'temp';
import { execSilent, exec, abstruse, killAllProcesses } from '../e2e/utils/process';
import * as ws from 'ws';
import { sendRequest } from '../helpers/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

let socket: ws;

describe('Socket Security', () => {

  before(function() {
    this.timeout(60000);
    let tempRoot = null;

    return Promise.resolve()
      .then(() => console.log('Building project for socket tests...'))
      .then(() => process.chdir(join(__dirname, '../')))
      .then(() => execSilent('npm',  ['run', 'build']))
      .then(() => console.log('Linking project...'))
      .then(() => execSilent('npm', ['link']))
      .then(() => {
        tempRoot = temp.mkdirSync('abstruse-socket-tests');
        console.log(`Using "${tempRoot}" as temporary directory for e2e protractor tests.`);
      })
      .then(() => abstruse(tempRoot, false));
  });

  after(() => killAllProcesses());

  it(`should receive initial 'time' event after connected to socket server`, (done) => {
    socket = new ws('ws://localhost:6501', null);

    socket.on('message', (data: any) => {
      data = JSON.parse(data);
      expect(data).to.have.all.keys('type', 'data');
      expect(data.type).to.equal('time');
      expect(data.data).to.not.be.a('null');
      done();
    });
  });

  it(`should not have permissions to trigger build image on 'buildImage' event`, (done) => {
    socket = new ws('ws://localhost:6501', null);

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({ type: 'buildImage', data: null })));
  });

  it(`should have permissions to trigger build image on 'buildImage' event`, (done) => {
    let registerData = {
      email: 'test@gmail.com', fullname: 'test',
      password: 'test', confirmPassword: 'test', admin: 1
    };
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(registerData, 'api/user/create')
      .then(() => sendRequest(loginData, 'api/user/login'))
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6501', jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => socket.send(JSON.stringify({ type: 'buildImage', data: null })));
      })
      .catch(err => console.error(err));
  });

});
