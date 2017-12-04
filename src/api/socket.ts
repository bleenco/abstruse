import * as uws from 'uws';
import * as http from 'http';
import * as https from 'https';
import * as uuid from 'uuid';
import * as querystring from 'querystring';
import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { logger, LogMessageType } from './logger';
import { getContainersStats } from './docker-stats';
import {
  processes,
  startBuild,
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
  socket: uws.Socket;
  send: Function;
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
    return new Observable(observer => {
      this.setupServer(this.options.app);
    });
  }

  private setupServer = (application: any) => {
    let config: any = getConfig();
    let server = null;

    if (config.ssl) {
      server = https.createServer({
        cert: readFileSync(config.sslcert),
        key: readFileSync(config.sslkey)
      }, application.app);
    } else {
      server = http.createServer(application.app);
    }

    const wss: uws.Server = new uws.Server({
      verifyClient: (info: any, done) => {
        const ip = info.req.headers['x-forwarded-for'] || info.req.connection.remoteAddress;
        const query = querystring.parse(info.req.url.substring(2));
        const user = { id: null, email: 'anonymous', isAdmin: false };

        if (query.token) {
          const userData = decodeJwt(query.token as string);
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
          done(info.req.session);
        });
      },
      server: server
    });

    wss.on('connection', socket => {
      const client: Client = {
        sessionID: socket.upgradeReq.sessionID,
        session: socket.upgradeReq.session,
        socket: socket,
        send: (message: any) => client.socket.send(JSON.stringify(message))
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
      socket.on('close', (code, message) => this.removeClient(socket));
    });

    server.listen(config.port, () => {
      const msg: LogMessageType = {
        message: `[server]: API and Socket Server running at port ${config.port}`,
        type: 'info',
        notify: false
      };
      logger.next(msg);
    });
  }

  private addClient(client: Client) {
    this.clients.push(client);
  }

  private removeClient(socket: uws.Socket) {
    const index = this.clients.findIndex(c => c.socket === socket);
    const client = this.clients[index];
    const msg: LogMessageType = {
      message: `[socket]: user ${client.session.email} from ${client.session.ip} disconnected`,
      type: 'info',
      notify: false
    };
    logger.next(msg);

    this.clients.splice(index, 1);
  }

  private handleEvent(event: any, client: Client) {
    switch (event.type) {
      case 'login': {
        const token = event.data;
        const decoded = !!token ? decodeJwt(token) : false;
        client.session.userId = decoded ? decoded.id : null;
        client.session.email = decoded ? decoded.email : 'anonymous';
        client.session.isAdmin = decoded ? decoded.admin : false;
      }
      break;

      case 'logout': {
        const email = client.session.email;
        const userId = client.session.userId;
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
          imageBuilderObs.subscribe(event => {
            client.send({ type: 'imageBuildProgress', data: event });
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
        const jobId = Number(event.data.jobId);
        const idx = processes.findIndex(proc => Number(proc.job_id) === jobId);
        if (idx !== -1) {
          const proc = processes[idx];
          client.send({ type: 'data', data: proc.log });
          client.send({ type: 'exposed ports', data: proc.exposed_ports || null });
          client.send({ type: 'debug', data: proc.debug || null });
        }

        terminalEvents
          .filter(e => e.job_id === parseInt(event.data.jobId, 10))
          .subscribe(output => client.send(output));
      break;

      case 'subscribeToLogs':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          logger.subscribe(msg => client.send(msg));
        }
      break;

      case 'subscribeToNotifications':
        if (client.session.email === 'anonymous') {
          client.send({ type: 'error', data: 'not authorized' });
        } else {
          client.send({ type: 'request_received' });
          logger.filter(msg => !!msg.notify).subscribe(msg => {
            const notify = { notification: msg, type: 'notification' };
            client.send(notify);
          });
        }
      break;

      case 'subscribeToStats':
        Observable.merge(...[
          memory(), cpu(), getContainersStats()
        ]).subscribe(event => client.send(event));
      break;
    }
  }
}
