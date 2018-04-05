import { Injectable, Provider, EventEmitter } from '@angular/core';
import { RxWebSocket, ConnectionStates } from '../classes/rx-web-socket.class';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { timer } from 'rxjs/observable/timer';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { share, retryWhen, switchMap, take } from 'rxjs/operators';

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
      const sub = this.socket.out.subscribe(subscriber);

      return () => {
        sub.unsubscribe();
      };
    })
    .pipe(
      share(),
      retryWhen(errors => {
        return errors.pipe(switchMap(err => {
          this.connectionState.next(ConnectionStates.RETRYING);
          if (navigator.onLine) {
            return timer(3000);
          } else {
            return fromEvent(window, 'online').pipe(take(1));
          }
        }));
      })
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

export const SocketServiceProvider: Provider = {
  provide: SocketService, useClass: SocketService
};
