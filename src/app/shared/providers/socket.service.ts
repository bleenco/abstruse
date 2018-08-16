import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subscriber, BehaviorSubject, timer, fromEvent } from 'rxjs';
import { share, retryWhen, take, switchMap } from 'rxjs/operators';
import { RxWebSocket, ConnectionStates } from '../models/socket.class';

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
  }

  connect(): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      const sub = this.socket.out.subscribe(subscriber);

      return () => {
        sub.unsubscribe();
      };
    })
      .pipe(
        share(),
        retryWhen(errors => errors.pipe(switchMap(err => {
          this.connectionState.next(ConnectionStates.RETRYING);

          if (navigator.onLine) {
            return timer(3000);
          } else {
            return fromEvent(window, 'online').pipe(take(1));
          }
        })))
      );
  }

  onMessage(): Observable<any> {
    return this.connect();
  }

  emit(msg: any) {
    const data = typeof msg === 'string' ? msg : JSON.stringify(msg);
    this.socket.in.next(data);
  }
}
