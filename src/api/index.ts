import { ExpressServer } from './server';
import { SocketServer } from './socket';
import { Observable } from 'rxjs';

const server = new ExpressServer({ port: 6500 });
const socket = new SocketServer({ port: 6501 });

Observable
  .merge(...[server.start(), socket.start()])
  .subscribe(data => {
    console.log(data);
  }, err => {
    console.error(err);
  }, () => {
    console.log('Done.');
  });
