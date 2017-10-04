import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { join } from 'path';
import * as temp from 'temp';
import { execSilent, exec, abstruse, killAllProcesses } from '../e2e/utils/process';
import * as ws from 'ws';

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

});
