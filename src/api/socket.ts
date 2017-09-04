import * as ws from 'ws';
import * as uuid from 'uuid';
import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { PtyInstance } from './pty';
import * as logger from './logger';
import * as docker from './docker';
import {
  startBuild,
  startSetup,
  findDockerImageBuildJob,
  jobEvents,
  restartJob,
  restartJobWithSshAndVnc,
  stopJob,
  restartBuild,
  stopBuild,
  terminalEvents,
  getJobProcesses
} from './process-manager';
import { getConfig } from './utils';
import * as https from 'https';
import * as http from 'http';
import { readFileSync } from 'fs';
import * as express from 'express';
import { yellow, red, blue, green } from 'chalk';
import { sessionParser } from './server';

export interface ISocketServerOptions {
  port: number;
}

export class SocketServer {
  options: ISocketServerOptions;
  connections: Observable<any>;
  clients: any[];
  connectingClient: any;

  constructor(options: ISocketServerOptions) {
    this.options = options;
    this.clients = [];
  }

  start(): Observable<string> {
    return new Observable(observer => {
      this.createRxServer(this.options)
        .map(data => {
          this.connectingClient = data.session;
          return this.createRxSocket(data.conn);
        })
        .subscribe(conn => {
          this.clients.push({ connection: conn, sub: null, session: this.connectingClient });

          // send server time for sync
          conn.next({ type: 'time', data: new Date().getTime() });

          // send client latest status about jobs
          jobEvents.subscribe(event => conn.next(event));

          conn.subscribe(event => {
            if (event.type === 'disconnected') {
              const index = this.clients.findIndex(client => client.connection === conn);
              const session = this.clients[index].session;
              let msg = [
                yellow('['),
                green('socket'),
                yellow(']'),
                ' --- ',
                `user ${session.userId} disconnected. clearing session ...`
              ].join('');
              logger.info(msg);

              this.clients.splice(index, 1);

              msg = [
                yellow('['),
                green('socket'),
                yellow(']'),
                ' --- ',
                `session cleared after user ${session.userId}`
              ].join('');
              logger.info(msg);
            }

            switch (event.type) {
              case 'initializeDockerImage':
                findDockerImageBuildJob('abstruse')
                  .then(dbuild => {
                    if (!dbuild) {
                      return startSetup('abstruse')
                        .then(() => findDockerImageBuildJob('abstruse'))
                        .then(build => build);
                    } else {
                      return Promise.resolve()
                        .then(() => dbuild);
                    }
                  })
                  .then(build => {
                    build.job.subscribe(event => {
                      conn.next({ type: 'terminalOutput', data: event });
                    }, err => {
                      console.error(err);
                    }, () => {
                      console.log('Docker image build completed.');
                    });
                  });
              break;
              case 'startBuild':
                startBuild({ repositories_id: event.data.repositoryId })
                  .then(buildId => {
                    console.log('New Build: ', buildId);
                  });
              break;
              case 'stopBuild':
                stopBuild(event.data.buildId)
                  .then(() => {
                    conn.next({ type: 'buildStopped', data: event.data.buildId });
                  });
              break;
              case 'restartBuild':
                restartBuild(event.data.buildId)
                  .then(() => {
                    conn.next({ type: 'buildRestarted', data: event.data.buildId });
                  });
              break;
              case 'restartJob':
                restartJob(parseInt(event.data.jobId, 10))
                  .then(() => {
                    conn.next({ type: 'jobRestarted', data: event.data.jobId });
                  });
              break;
              case 'restartJobWithSshAndVnc':
                restartJobWithSshAndVnc(parseInt(event.data.jobId, 10))
                  .then(() => {
                    conn.next({ type: 'jobRestarted', data: event.data.jobId });
                  });
              break;
              case 'stopJob':
                stopJob(event.data.jobId)
                  .then(() => {
                    conn.next({ type: 'jobStopped', data: event.data.jobId });
                  });
              break;
              case 'subscribeToJobOutput':
                getJobProcesses()
                  .then(procs => {
                    const proc = procs.find(job => job.job_id === parseInt(event.data.jobId, 10));
                    if (proc) {
                      conn.next({ type: 'data', data: proc.log.join('\n') });
                    }
                  });

                const index = this.clients.findIndex(client => client.connection === conn);
                if (this.clients[index].sub) {
                  this.clients[index].sub.unsubscribe();
                }

                this.clients[index].sub = terminalEvents
                  .filter(e => e.job_id === parseInt(event.data.jobId, 10))
                  .subscribe(output => conn.next(output));
              break;
            }
          });
        });
    });
  }

  private createRxServer = (options: ws.IServerOptions) => {
    return new Observable((observer: Observer<any>) => {
      let config: any = getConfig();
      let server;

      if (config.ssl) {
        server = https.createServer({
          cert: readFileSync(config.sslcert),
          key: readFileSync(config.sslkey)
        }, express());
      } else {
        server = http.createServer();
      }

      server.listen(options.port);
      let msg = [
        yellow('['),
        green('socket'),
        yellow(']'),
        ' --- ',
        `socket server running at port ${options.port}`
      ].join('');
      logger.info(msg);

      let wss: ws.Server = new ws.Server({
        verifyClient: (info: any, done) => {
          const id = uuid();
          const ip = info.req.headers['x-forwarded-for'] || info.req.connection.remoteAddress;
          let msg = [
            yellow('['),
            green('socket'),
            yellow(']'),
            ' --- ',
            `updating session for user ${id} (${ip})`
          ].join('');
          logger.info(msg);

          sessionParser(info.req, {} as any, () => {
            info.req.session.userId = id;
            info.req.session.ip = ip;
            done(info.req.session.userId);
          });
        },
        server
      });

      wss.on('connection', (connection: any, req: any) => {
        observer.next({ conn: connection, session: req.session });

        let msg = [
          yellow('['),
          green('socket'),
          yellow(']'),
          ' --- ',
          `socket connection established ${req.session.userId}`
        ].join('');
        logger.info(msg);
      });

      return () => {
        wss.close();
      };
    }).share();
  }

  private createRxSocket = (connection: any) => {
    let messages = Observable.fromEvent(connection, 'message', msg => {
      return JSON.parse(msg.data);
    }).merge(Observable.fromEvent(connection, 'close', () => {
      return { type: 'disconnected' };
    }));

    let messageObserver: any = {
      next(message) {
        if (connection.readyState === 1) {
          connection.send(JSON.stringify(message));
        }
      }
    };

    return Subject.create(messageObserver, messages);
  }
}
