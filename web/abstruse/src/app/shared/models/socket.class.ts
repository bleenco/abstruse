import { getWebSocketURL } from '../../core/shared/shared-functions';
import { Observable, Subscriber, Observer } from 'rxjs';

export enum ConnectionStates {
  CONNECTING,
  CONNECTED,
  CLOSED,
  RETRYING
}

export class RxWebSocket {
  socket: WebSocket;
  messageQueue: string[] = [];
  didOpen: (e: Event) => void;
  willOpen: () => void;
  didClose: (e?: any) => void;
  out$: Observable<any>;
  in$: Observer<any>;

  constructor() { }

  selector(e: MessageEvent) {
    return JSON.parse(e.data);
  }

  get out(): Observable<any> {
    if (!this.out$) {
      this.out$ = new Observable((subscriber: Subscriber<any>) => {
        const wsurl = getWebSocketURL();
        this.socket = new WebSocket(wsurl);

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
          this.out$ = null;
        };
      });
    }

    return this.out$;
  }

  send(message: any) {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      this.messageQueue.push(data);
    }
  }

  get in(): Observer<any> {
    if (!this.in$) {
      this.in$ = {
        next: (message: any) => {
          const data = typeof message === 'string' ? message : JSON.stringify(message);
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

    return this.in$;
  }

  flushMessages() {
    const messageQueue = this.messageQueue;
    while (messageQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(messageQueue.shift());
    }
  }
}
