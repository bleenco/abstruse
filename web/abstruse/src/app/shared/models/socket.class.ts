import { Observable, Subscriber, Observer } from 'rxjs';

export enum ConnectionStates {
  CONNECTING,
  CONNECTED,
  CLOSED,
  RETRYING
}

export class RxWebSocket {
  socket!: WebSocket | null;
  messageQueue: string[] = [];
  didOpen!: (e: Event) => void;
  willOpen!: () => void;
  didClose!: (e?: any) => void;
  out$!: Observable<any> | null;
  in$: Observer<any> | null = null;

  constructor() {}

  selector(e: MessageEvent): void {
    return JSON.parse(e.data);
  }

  get out(): Observable<any> {
    if (!this.out$) {
      this.out$ = new Observable((subscriber: Subscriber<any>) => {
        this.socket = new WebSocket(this.wsURL);

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
          if (this.socket) {
            this.socket.close();
            this.socket = null;
          }
          this.out$ = null;
        };
      });
    }

    return this.out$;
  }

  send(message: any): void {
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
            this.socket.send(data);
          } else {
            this.messageQueue.push(data);
          }
        },
        error: (err: any) => {
          if (this.socket) {
            this.socket.close(3000, err);
            this.socket = null;
          }
        },
        complete: () => {
          if (this.socket) {
            this.socket.close();
            this.socket = null;
          }
        }
      };
    }

    return this.in$;
  }

  get wsURL(): string {
    const secure = location.protocol === 'https:' ? true : false;
    const port = location.port === '80' ? '' : `:${location.port}`;

    if (secure) {
      return `wss://${location.hostname}${port}/ws`;
    } else {
      return `ws://${location.hostname}${port}/ws`;
    }
  }

  flushMessages(): void {
    if (!this.socket) {
      return;
    }
    const messageQueue = this.messageQueue;
    while (messageQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(messageQueue.shift() as string);
    }
  }
}
