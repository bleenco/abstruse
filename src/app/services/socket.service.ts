import { Injectable, Provider, EventEmitter } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscriber, Subscription } from 'rxjs';
import { RxWebSocket, ConnectionStates } from '../classes/rx-web-socket.class';

@Injectable()
export class SocketService {
  connectionState: BehaviorSubject<ConnectionStates>;
  socket: RxWebSocket;
  outputEvents: EventEmitter<any>;
  timeSyncDiff: number;

  constructor() {
    this.socket = new RxWebSocket();
    this.connectionState = new BehaviorSubject<ConnectionStates>(ConnectionStates.CONNECTING);
    this.socket.didOpen = () => this.connectionState.next(ConnectionStates.CONNECTED);
    this.socket.willOpen = () => this.connectionState.next(ConnectionStates.CONNECTING);
    this.socket.didClose = () => this.connectionState.next(ConnectionStates.CLOSED);
    this.outputEvents = new EventEmitter<any>();
    this.onMessage().subscribe(event => {
      if (event.type === 'time') {
        this.timeSyncDiff = new Date().getTime() - event.data;
      } else {
        this.outputEvents.emit(event);
      }
    });
  }

  connect(): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      let sub = this.socket.out.subscribe(subscriber);

      return () => {
        sub.unsubscribe();
      };
    })
    .share()
    .retryWhen(errors => errors.switchMap(err => {
      this.connectionState.next(ConnectionStates.RETRYING);

      if (navigator.onLine) {
        return Observable.timer(3000);
      } else {
        return Observable.fromEvent(window, 'online').take(1);
      }
    }));
  }

  onMessage(): Observable<any> {
    return this.connect();
  }

  emit(msg: any) {
    let data = typeof msg === 'string' ? msg : JSON.stringify(msg);
    this.socket.in.next(data);
  }
}

export const SocketServiceProvider: Provider = {
  provide: SocketService, useClass: SocketService
};
