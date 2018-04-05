import { ConfigService } from '../services/config.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export enum ConnectionStates {
  CONNECTING,
  CONNECTED,
  CLOSED,
  RETRYING
}

export class RxWebSocket {
  config: ConfigService;
  socket: WebSocket;
  messageQueue: string[] = [];
  didOpen: (e: Event) => void;
  willOpen: () => void;
  didClose: (e?: any) => void;
  _out: Observable<any>;
  _in: Observer<any>;

  constructor() {
    this.config = new ConfigService();
  }

  selector(e: MessageEvent) {
    return JSON.parse(e.data);
  }

  get out(): Observable<any> {
    if (!this._out) {
      this._out = Observable.create((subscriber: Subscriber<any>) => {
        this.socket = new WebSocket(this.config.wsurl);

        if (this.willOpen) {
          this.willOpen();
        }

        this.socket.onopen = (e: any) => {
          this.flushMessages();
          if (this.didOpen) {
            this.didOpen(e);
          }
        };

        this.socket.onclose = (e: any) => {
          if (e.wasClean) {
            subscriber.complete();
            if (this.didClose) {
              this.didClose(e);
            }
          } else {
            subscriber.error(e);
          }
        };

        this.socket.onerror = (e: any) => subscriber.error(e);
        this.socket.onmessage = (e: any) => subscriber.next(this.selector(e));

        return () => {
          this.socket.close();
          this.socket = null;
          this._out = null;
        };
      });
    }

    return this._out;
  }

  send(message: any) {
    let data = typeof message === 'string' ? message : JSON.stringify(message);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      this.messageQueue.push(data);
    }
  }

  get in(): Observer<any> {
    if (!this._in) {
      this._in = {
        next: (message: any) => {
          let data = typeof message === 'string' ? message : JSON.stringify(message);
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
          } else {
            this.messageQueue.push(message);
          }
        },
        error: (err: any) => {
          this.socket.close(3000, err);
          this.socket = null;
        },
        complete: () => {
          this.socket.close();
          this.socket = null;
        }
      };
    }

    return this._in;
  }

  flushMessages() {
    let messageQueue = this.messageQueue;
    while (messageQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(messageQueue.shift());
    }
  }
}
