import * as ws from 'ws';
import * as uuid from 'uuid';
import { Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { PtyInstance } from './pty';
import * as logger from './logger';
import * as docker from './docker';
import { processes, startBuildProcess } from './process';

export interface ISocketServerOptions {
  port: number;
}

export class SocketServer {
  options: ISocketServerOptions;
  connections: Observable<any>;
  ptyProcesses: any[];

  constructor(options: ISocketServerOptions) {
    this.options = options;
    this.ptyProcesses = [];
  }

  start(): Observable<string> {
    return new Observable(observer => {
      this.createRxServer(this.options)
        .map(this.createRxSocket)
        .subscribe(conn => {
          // const pty = new PtyInstance();
          // const process = pty.create();
          // this.ptyProcesses.push(process);

          // process.on('data', data => conn.next({ type: 'terminalOutput', data: data }));
          // process.on('exit', code => {
          //   process.kill('SIGHUP');
          //   conn.next({ type: 'terminalExit', data: code });
          // });

          conn.subscribe(event => {
            if (event.type === 'data') {
              if (event.data === 'initializeDockerImage') {
                // process.write('docker build -t abstruse ~/.abstruse/docker-files\r');
                // process.write('exit\r');
              } else if (event.data === 'runBuild') {
                if (!processes.length) {
                  startBuildProcess();
                }

                let proc = processes[0];
                proc.log.forEach(line => {
                  conn.next({ type: 'terminalOutput', data: line });
                });

                proc.pty.subscribe(data => {
                  if (data.type === 'data') {
                    conn.next({ type: 'terminalOutput', data: data.message });
                  } else if (data.type === 'exit') {
                    conn.next({ type: 'terminalExit', data: data.message });
                  }
                });
              }
            } else if (event.type === 'resize') {
              // if (tty) {
              //   tty.next({ action: 'resize', col: event.data.cols, row: event.data.rows });
              // }
            }
          });
        });
    });
  }

  private createRxServer = (options: ws.IServerOptions) => {
    return new Observable((observer: Observer<any>) => {
      logger.info(`Socket server running at port ${options.port}`);
      let wss: ws.Server = new ws.Server(options);
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
    });

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
