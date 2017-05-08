import * as ws from 'ws';
import { Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { PtyInstance } from './pty';

export interface ISocketServerOptions {
  port: number;
}

export class SocketServer {
  options: ISocketServerOptions;
  connections: Observable<any>;

  constructor(options: ISocketServerOptions) {
    this.options = options;
  }

  start(): Observable<null> {
    return new Observable(observer => {
      this.createRxServer(this.options)
        .map(this.createRxSocket)
        .subscribe(conn => {
          conn.subscribe(event => {
            const pty = new PtyInstance();
            const process = pty.create();
            if (event.type === 'data') {
              if (event.data === 'initializeDockerImage') {
                process.on('data', data => conn.next({ type: 'terminalOutput', data: data }));
                process.on('exit', code => conn.next({ type: 'terminalExit', data: code }));
                process.write('docker build -t abstruse ~/.abstruse/docker-files\r');
                process.write('exit\r');
              }
            } else if (event.type === 'resize') {
              process.resize(event.data.cols, event.data.rows);
            }
          });
        });
    });
  }

  private createRxServer = (options: ws.IServerOptions) => {
    return new Observable((observer: Observer<any>) => {
      console.log(`Socket server running at port ${options.port}...`);
      let wss: ws.Server = new ws.Server(options);
      wss.on('connection', (client: ws) => observer.next(client));

      return () => {
        wss.close();
      };
    }).share();
  }

  private createRxSocket = (connection: any) => {
    let messages = Observable.fromEvent(connection, 'message', msg => {
      return JSON.parse(msg.data);
    }).merge(Observable.create(observer => {
      connection.on('close', () => {
        connection.close();
        observer.next(JSON.stringify({ type: 'close' }));
      });
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
