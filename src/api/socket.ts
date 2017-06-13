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
  stopJob,
  terminalEvents,
  getJobProcess
} from './process-manager';
import { getConfig } from './utils';
import * as https from 'https';
import * as http from 'http';
import { readFileSync } from 'fs';
import * as express from 'express';

export interface ISocketServerOptions {
  port: number;
}

export class SocketServer {
  options: ISocketServerOptions;
  connections: Observable<any>;
  clients: any[];

  constructor(options: ISocketServerOptions) {
    this.options = options;
    this.clients = [];
  }

  start(): Observable<string> {
    return new Observable(observer => {
      this.createRxServer(this.options)
        .map(this.createRxSocket)
        .subscribe(conn => {
          const client = { connection: conn, sub: null };
          this.clients.push(client);

          // send server time for sync
          conn.next({ type: 'time', data: new Date().getTime() });

          // send client latest status about jobs
          jobEvents.subscribe(event => conn.next(event));

          conn.subscribe(event => {
            if (event.type === 'disconnected') {
              const connIndex = this.clients.findIndex(client => client.connection === conn);
              if (connIndex !== -1) {
                this.clients.splice(connIndex, 1);
                logger.info(`client ${connIndex + 1} disconnected`);
              }
            }

            switch (event.type) {
              case 'initializeDockerImage':
                let build = findDockerImageBuildJob('abstruse');
                if (!build) {
                  startSetup('abstruse');
                  build = findDockerImageBuildJob('abstruse');
                }

                build.job.subscribe(event => {
                  conn.next({ type: 'terminalOutput', data: event });
                }, err => {
                  console.error(err);
                }, () => {
                  console.log('Docker image build completed.');
                });
              break;
              case 'startBuild':
                startBuild(event.data.repositoryId, event.data.branch)
                  .then(buildId => {
                    console.log('New Build: ', buildId);
                  });
              break;
              case 'restartBuild':

              break;
              case 'restartJob':
                restartJob(event.data.jobId);
              break;
              case 'stopJob':
                stopJob(event.data.jobId);
              break;
              case 'subscribeToJobOutput':
                const jobProcess = getJobProcess(parseInt(event.data.jobId, 10));
                if (jobProcess) {
                  conn.next({ type: 'data', data: jobProcess.log.join('\n') });
                }

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
          cert: readFileSync(config.cert),
          key: readFileSync(config.key)
        }, express());
      } else {
        server = http.createServer();
      }

      server.listen(options.port);
      logger.info(`Socket server running at port ${options.port}`);

      let wss: ws.Server = new ws.Server({ server: server });
      wss.on('connection', (connection: ws) => {
        observer.next(connection);
        logger.info(`socket connection established.`);
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
