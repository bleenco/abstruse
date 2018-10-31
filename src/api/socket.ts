import * as express from 'express';
import { readFileSync } from 'fs-extra';
import * as http from 'http';
import * as https from 'https';
import * as querystring from 'querystring';
import { merge, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as uws from 'uws';

import { getLastBuild } from './db/build';
import { getContainersStats } from './docker-stats';
import { buildDockerImage, deleteImage, imageBuilderObs } from './image-builder';
import { logger, LogMessageType } from './logger';
import {
  debugJob,
  jobEvents,
  processes,
  restartBuild,
  restartJob,
  stopBuild,
  stopJob,
  terminalEvents,
} from './process-manager';
import { decodeJwt } from './security';
import { sessionParser } from './server';
import { getConfig } from './setup';
import { cpu, ICpuData } from './stats/cpu';
import { IMemoryData, memory } from './stats/memory';

export interface ISocketServerOptions {
  app: express.Application;
}

export interface IOutput {
  type: string;
  data: IMemoryData | ICpuData;
}

export interface Client {
  sessionID: string;
  session: {
    cookie: any;
    ip: string;
    userId: number;
    email: string;
    isAdmin: boolean;
  };
  socket: uws.Socket;
  send: Function;
  subscriptions: {
    stats: Subscription;
    jobOutput: Subscription;
    logs: Subscription;
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
    let config: any = getConfig();
    let server = null;

    if (config.ssl) {
      server = https.createServer({
        cert: readFileSync(config.sslcert),
        key: readFileSync(config.sslkey)
      }, application);
    } else {
      server = http.createServer(application);
    }

    let wss: uws.Server = new uws.Server({
      verifyClient: async (info: any, done) => {
        let ip = info.req.headers['x-forwarded-for'] || info.req.connection.remoteAddress;
        let query = querystring.parse(info.req.url.substring(2));
        let user = { id: null, email: 'anonymous', isAdmin: false };

        if (query.token) {
          let userData = await decodeJwt(query.token as string);
          if (userData) {
            user.id = userData.id;
            user.email = userData.email;
            user.isAdmin = userData.admin;
          }
        }

        let msg: LogMessageType = {
          message: `[socket]: user ${user.email} connected from ${ip}`,
          type: 'info',
          notify: false
        };
        logger.next(msg);

        sessionParser(info.req, {} as any, () => {
          info.req.session.ip = ip;
          info.req.session.userId = user.id;
          info.req.session.email = user.email;
          done(info.req.session);
        });
      },
      server: server
    });

    wss.on('connection', socket => {
      let client: Client = {
        sessionID: socket.upgradeReq.sessionID,
        session: socket.upgradeReq.session,
        socket: socket,
        send: (message: any) => client.socket.send(JSON.stringify(message)),
        subscriptions: { stats: null, jobOutput: null, logs: null }
      };
      this.addClient(client);

      client.send({ type: 'time', data: new Date().getTime() });
      jobEvents.subscribe(event => {
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

      socket.on('message', event => this.handleEvent(JSON.parse(event), client));
      socket.on('close', () => this.removeClient(socket));
    });

    server.listen(config.port, () => {
      let msg: LogMessageType = {
        message: `[server]: API and Socket Server running at port ${config.port}`,
        type: 'info',
        notify: false
      };
      logger.next(msg);
    });
  }

  private addClient(client: Client): void {
    this.clients.push(client);
  }

  private removeClient(socket: uws.Socket): void {
    let index = this.clients.findIndex(c => c.socket === socket);
    let client = this.clients[index];

    Object.keys(client.subscriptions).forEach(sub => {
      if (client.subscriptions[sub]) {
        client.subscriptions[sub].unsubscribe();
      }
    });

    let msg: LogMessageType = {
      message: `[socket]: user ${client.session.email} from ${client.session.ip} disconnected`,
      type: 'info',
      notify: false
    };
    logger.next(msg);

    this.clients.splice(index, 1);
  }

  private async handleEvent(event: any, client: Client): Promise<void> {
    switch (event.type) {
      case 'login': {
        let token = event.data;
        let decoded = !!token ? await decodeJwt(token) : false;
        client.session.userId = decoded ? decoded.id : null;
        client.session.email = decoded ? decoded.email : 'anonymous';
        client.session.isAdmin = decoded ? decoded.admin : false;
      }
        break;

      case 'logout': {
        client.session.userId = null;
        client.session.email = 'anonymous';
        client.session.isAdmin = false;
      }
        break;

      case 'buildImage': {
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          let imageData = event.data;
          buildDockerImage(imageData);
        }
      }
        break;

      case 'deleteImage': {
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          let imageData = event.data;
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
          restartJob(parseInt(event.data.jobId, 10))
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
        let jobId = Number(event.data.jobId);
        let idx = processes.findIndex(proc => Number(proc.job_id) === jobId);
        if (idx !== -1) {
          let proc = processes[idx];
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
            let notify = { notification: msg, type: 'notification' };
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
