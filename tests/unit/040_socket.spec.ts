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
    let registerData = {
      email: 'test@gmail.com', fullname: 'test',
      password: 'test', confirmPassword: 'test', admin: 1
    };

    return Promise.resolve()
      .then(() => console.log('Building project for socket tests...'))
      .then(() => process.chdir(join(__dirname, '../')))
      .then(() => {
        tempRoot = temp.mkdirSync('abstruse-socket-tests');
        console.log(`Using "${tempRoot}" as temporary directory for socket unit tests.`);
      })
      .then(() => abstruse(tempRoot, false))
      .then(() => sendRequest(registerData, 'api/user/create'));
  });

  after(() => killAllProcesses());

  it(`should receive initial 'time' event after connected to socket server`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);
      expect(data).to.have.all.keys('type', 'data');
      expect(data.type).to.equal('time');
      expect(data.data).to.not.be.a('null');
      done();
    });
  });

  it(`should not have permissions to trigger build image on 'buildImage' event`, (done) => {
    socket = new ws('ws://localhost:6500');

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
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'buildImage', data: { name: 'test' }}));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'subscribeToImageBuilder' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => {
      return socket.send(JSON.stringify({ type: 'subscribeToImageBuilder', data: null }));
    });
  });

  it(`should have permissions to trigger 'subscribeToImageBuilder' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'subscribeToImageBuilder', data: null }));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'stopBuild' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({ type: 'stopBuild', data: null })));
  });

  it(`should have permissions to trigger 'stopBuild' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'stopBuild', data: { buildId: -1 } }));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'restartBuild' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({ type: 'restartBuild', data: null })));
  });

  it(`should have permissions to trigger 'restartBuild' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'restartBuild', data: { buildId: -1 } }));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'restartJob' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({ type: 'restartJob', data: null })));
  });

  it(`should have permissions to trigger 'restartJob' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'restartJob', data: { jobId: -1 } }));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'stopJob' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({ type: 'stopJob', data: null })));
  });

  it(`should have permissions to trigger 'stopJob' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'stopJob', data: { jobId: -1 } }));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'debugJob' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({type: 'debugJob', data: null })));
  });

  it(`should have permissions to trigger 'debugJob' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };
    let data = { jobId: 1, debug: false };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'subscribeToNotifications', data: data }));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'subscribeToLogs' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({ type: 'subscribeToLogs', data: null })));
  });

  it(`should have permissions to trigger 'subscribeToLogs' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'subscribeToLogs', data: null }));
        });
      })
      .catch(err => console.error(err));
  });

  it(`should not have permissions to trigger 'subscribeToNotifications' event`, (done) => {
    socket = new ws('ws://localhost:6500');

    socket.on('message', (data: any) => {
      data = JSON.parse(data);

      if (data.type === 'error') {
        expect(data.data).to.equal('not authorized');
        done();
      }
    });

    socket.on('open', () => socket.send(JSON.stringify({
      type: 'subscribeToNotifications', data: null })));
  });

  it(`should have permissions to trigger 'subscribeToNotifications' event`, (done) => {
    let loginData = { email: 'test@gmail.com', password: 'test' };

    sendRequest(loginData, 'api/user/login')
      .then((jwt: any) => {
        socket = new ws('ws://localhost:6500/?token=' + jwt.data);

        socket.on('message', (data: any) => {
          data = JSON.parse(data);
          if (data.type === 'request_received') {
            done();
          }
        });

        socket.on('open', () => {
          return socket.send(JSON.stringify({ type: 'subscribeToNotifications', data: null }));
        });
      })
      .catch(err => console.error(err));
  });
});
