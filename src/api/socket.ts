import * as ws from 'ws';
import * as uuid from 'uuid';
import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { logger, LogMessageType } from './logger';
import * as docker from './docker';
import {
  processes,
  startBuild,
  jobEvents,
  restartJob,
  stopJob,
  restartBuild,
  stopBuild,
  terminalEvents
} from './process-manager';
import { imageBuilder, buildDockerImage } from './image-builder';
import { getConfig } from './utils';
import * as https from 'https';
import * as http from 'http';
import { readFileSync } from 'fs';
import * as express from 'express';
import { yellow, red, blue, green } from 'chalk';
import { sessionParser } from './server';
import { IMemoryData, memory } from './stats/memory';
import { ICpuData, cpu } from './stats/cpu';

export interface ISocketServerOptions {
  port: number;
}

export interface IOutput {
  type: string;
  data: IMemoryData | ICpuData;
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

          const clientIndex = this.clients.length - 1;

          // send server time for sync
          conn.next({ type: 'time', data: new Date().getTime() });

          // send client latest status about jobs
          jobEvents.subscribe(event => conn.next(event));

          conn.subscribe(event => {
            if (event.type === 'disconnected') {
              const index = this.clients.findIndex(client => client.connection === conn);
              const session = this.clients[index].session;
              this.clients.splice(index, 1);

              const msg: LogMessageType = {
                message: `[socket]: user ${session.userId} disconnected`,
                type: 'info',
                notify: false
              };
              logger.next(msg);
            }

            switch (event.type) {
              case 'buildImage': {
                const imageData = event.data;
                buildDockerImage(imageData);
              }
              break;

              case 'subscribeToImageBuilder': {
                imageBuilder.subscribe(event => {
                  conn.next({ type: 'imageBuildProgress', data: event });
                });
              }
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
                    conn.next({ type: 'build stopped', data: event.data.buildId });
                  });
              break;
              case 'restartBuild':
                restartBuild(event.data.buildId)
                  .then(() => {
                    conn.next({ type: 'build restarted', data: event.data.buildId });
                  });
              break;
              case 'restartJob':
                restartJob(parseInt(event.data.jobId, 10))
                  .then(() => {
                    conn.next({ type: 'job restarted', data: event.data.jobId });
                  });
              break;
              case 'stopJob':
                stopJob(event.data.jobId)
                  .then(() => {
                    conn.next({ type: 'job stopped', data: event.data.jobId });
                  });
              break;

              case 'subscribeToJobOutput':
                const jobId = parseInt(event.data.jobId, 10);
                const idx = processes.findIndex(proc => proc.job_id === jobId);
                if (idx !== -1) {
                  const proc = processes[idx];
                  conn.next({ type: 'data', data: proc.log.join('\n') });
                  conn.next({ type: 'exposed ports', data: proc.exposed_ports });
                }

                const index = this.clients.findIndex(client => client.connection === conn);
                if (this.clients[index].sub) {
                  this.clients[index].sub.unsubscribe();
                }

                this.clients[index].sub = terminalEvents
                  .filter(e => e.job_id === parseInt(event.data.jobId, 10))
                  .subscribe(output => conn.next(output));
              break;

              case 'subscribeToLogs':
                logger.subscribe(msg => conn.next(msg));
              break;

              case 'subscribeToNotifications':
                logger.filter(msg => !!msg.notify).subscribe(msg => {
                  const notify = { notification: msg, type: 'notification' };
                  conn.next(notify);
                });
              break;

              case 'subscribeToStats':
                this.clients[clientIndex].sub = Observable.merge(...[
                  memory(), cpu(), docker.getContainersStats()
                ]).subscribe(event => conn.next(event));
              break;
              case 'unsubscribeFromStats':
                if (this.clients[clientIndex].sub) {
                  this.clients[clientIndex].sub.unsubscribe();
                }
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
      const msg: LogMessageType = {
        message: `[socket]: server running at port ${options.port}`,
        type: 'info',
        notify: false
      };
      logger.next(msg);

      let wss: ws.Server = new ws.Server({
        verifyClient: (info: any, done) => {
          const id = uuid();
          const ip = info.req.headers['x-forwarded-for'] || info.req.connection.remoteAddress;
          const msg: LogMessageType = {
            message: `[socket]: user ${id} connected from ${ip}`,
            type: 'info',
            notify: false
          };
          logger.next(msg);

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

        const msg: LogMessageType = {
          message: `[socket]: user ${req.session.userId} succesfully connected`,
          type: 'info',
          notify: false
        };
        logger.next(msg);
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
