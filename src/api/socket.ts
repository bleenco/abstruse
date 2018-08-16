import * as WebSocket from 'ws';
import * as http from 'http';
import * as https from 'https';
import { Observable, Subscription, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { logger, LogMessageType } from './logger';
import { getContainersStats } from './docker-stats';
import {
  processes,
  jobEvents,
  restartJob,
  stopJob,
  debugJob,
  restartBuild,
  stopBuild,
  terminalEvents
} from './process-manager';
import { imageBuilderObs, buildDockerImage, deleteImage } from './image-builder';
import { getConfig } from './setup';
import { readFileSync } from 'fs';
import * as express from 'express';
import { sessionParser } from './server';
import { IMemoryData, memory } from './stats/memory';
import { ICpuData, cpu } from './stats/cpu';
import { decodeJwt } from './security';
import { getLastBuild } from './db/build';

export interface ISocketServerOptions {
  app: express.Application;
}

export interface IOutput {
  type: string;
  data: IMemoryData | ICpuData;
}

export interface Client {
  sessionID: string;
  session: { cookie: any, ip: string, userId: number, email: string, isAdmin: boolean };
  socket: WebSocket;
  send: Function;
  subscriptions: {
    stats: Subscription,
    jobOutput: Subscription,
    logs: Subscription,
    jobEvents: Subscription
  };
}

export class SocketServer {
  options: ISocketServerOptions;
  connections: Observable<any>;
  clients: Client[];

  constructor(options: ISocketServerOptions) {
    this.options = options;
    this.clients = [];
  }

  start(): Observable<string> {
    return new Observable(() => this.setupServer(this.options.app));
  }

  private setupServer(application: any): void {
    const config: any = getConfig();
    let server = null;

    if (config.ssl) {
      server = https.createServer({
        cert: readFileSync(config.sslcert),
        key: readFileSync(config.sslkey)
      }, application);
    } else {
      server = http.createServer(application);
    }

    const wss: WebSocket.Server = new WebSocket.Server({
      verifyClient: (info: any, done) => {
        const ip = info.req.headers['x-forwarded-for'] || info.req.connection.remoteAddress;
        const token = info.req.headers['sec-websocket-protocol'] || '';
        const user = { id: null, email: 'anonymous', isAdmin: false };

        if (token && token !== '') {
          const userData = decodeJwt(token as string);
          if (userData) {
            user.id = userData.id;
            user.email = userData.email;
            user.isAdmin = userData.isAdmin;
          }
        }

        const msg: LogMessageType = {
          message: `[socket]: user ${user.email} connected from ${ip}`,
          type: 'info',
          notify: false
        };
        logger.next(msg);

        sessionParser(info.req, {} as any, () => {
          info.req.session.ip = ip;
          info.req.session.userId = user.id;
          info.req.session.email = user.email;
          done(info.req.session.userId);
        });
      },
      server: server
    });

    wss.on('connection', (socket: WebSocket, req: any) => {
      const client: Client = {
        sessionID: req.session.id,
        session: req.session,
        socket: socket,
        send: (message: any) => {
          // if (typeof message === 'object' && !Object.keys(message).length || client.socket.CLOSED) {
          //   return;
          // }
          client.socket.send(JSON.stringify(message));
        },
        subscriptions: { stats: null, jobOutput: null, logs: null, jobEvents: null }
      };
      this.addClient(client);

      client.send({ type: 'time', data: new Date().getTime() });
      client.subscriptions.jobEvents = jobEvents.subscribe(event => {
        if (event.data === 'build added') {
          getLastBuild(client.session.userId)
            .then(lastBuild => {
              event.additionalData = lastBuild;
              client.send(event);
            });
        } else {
          client.send(event);
        }
      });

      socket.on('message', (event: WebSocket.Data) => {
        this.handleEvent(JSON.parse(event.toString()), client);
      });
      socket.on('close', () => this.removeClient(socket));
    });

    server.listen(config.port, () => {
      const msg: LogMessageType = {
        message: `[server]: server listening on port ${config.port}`,
        type: 'info',
        notify: false
      };
      logger.next(msg);
    });
  }

  private addClient(client: Client): void {
    this.clients.push(client);
  }

  private removeClient(socket: WebSocket): void {
    const index = this.clients.findIndex(c => c.socket === socket);
    const client = this.clients[index];

    Object.keys(client.subscriptions).forEach(sub => {
      if (client.subscriptions[sub]) {
        client.subscriptions[sub].unsubscribe();
      }
    });

    const msg: LogMessageType = {
      message: `[socket]: user ${client.session.email} from ${client.session.ip} disconnected`,
      type: 'info',
      notify: false
    };
    logger.next(msg);

    this.clients.splice(index, 1);
  }

  private handleEvent(event: any, client: Client): void {
    switch (event.type) {

      case 'buildImage': {
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          const imageData = event.data;
          buildDockerImage(imageData);
        }
      }
        break;

      case 'deleteImage': {
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          const imageData = event.data;
          deleteImage(imageData);
        }
      }
        break;

      case 'subscribeToImageBuilder': {
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          imageBuilderObs.subscribe(e => {
            client.send({ type: 'imageBuildProgress', data: e });
          });
        }
      }
        break;

      case 'stopBuild':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          stopBuild(event.data.buildId)
            .then(() => {
              client.send({ type: 'build stopped', data: event.data.buildId });
            });
        }
        break;

      case 'restartBuild':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          restartBuild(event.data.buildId)
            .then(() => {
              client.send({ type: 'build restarted', data: event.data.buildId });
            });
        }
        break;

      case 'restartJob':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          restartJob(Number(event.data.jobId))
            .then(() => {
              client.send({ type: 'job restarted', data: event.data.jobId });
            });
        }
        break;

      case 'stopJob':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          stopJob(event.data.jobId)
            .then(() => {
              client.send({ type: 'job stopped', data: event.data.jobId });
            });
        }
        break;

      case 'debugJob':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          debugJob(event.data.jobId, event.data.debug)
            .then(() => {
              client.send({ type: 'job debug', data: event.data.jobId });
            });
        }
        break;

      case 'subscribeToJobOutput':
        const jobId = Number(event.data.jobId);
        const idx = processes.findIndex(proc => Number(proc.job_id) === jobId);
        if (idx !== -1) {
          const proc = processes[idx];
          client.send({ type: 'jobLog', data: proc.log });
          client.send({ type: 'exposed ports', data: proc.exposed_ports || null });
          client.send({ type: 'debug', data: proc.debug || null });
        }

        client.subscriptions.jobOutput = terminalEvents
          .pipe(filter(e => Number(e.job_id) === Number(event.data.jobId)))
          .subscribe(output => client.send(output));
        break;

      case 'subscribeToLogs':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          client.subscriptions.logs = logger.subscribe(msg => client.send(msg));
        }
        break;

      case 'subscribeToNotifications':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          logger.pipe(filter((msg: any) => !!msg.notify)).subscribe(msg => {
            const notify = { notification: msg, type: 'notification' };
            client.send(notify);
          });
        }
        break;

      case 'subscribeToStats':
        client.subscriptions.stats = merge(...[memory(), cpu(), getContainersStats()])
          .subscribe(e => client.send(e));
        break;

      case 'unsubscribeFromStats':
        if (client.subscriptions.stats) {
          client.subscriptions.stats.unsubscribe();
        }
        break;
    }
  }
}
