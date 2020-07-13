import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subscriber, BehaviorSubject, timer, fromEvent } from 'rxjs';
import { share, retryWhen, take, switchMap } from 'rxjs/operators';
import { RxWebSocket, ConnectionStates } from '../models/socket.class';
import { SocketEvent } from '../models/socket.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
  connectionState: BehaviorSubject<ConnectionStates>;
  socket: RxWebSocket;
  timeSyncDiff!: number;
  connected: EventEmitter<boolean>;

  constructor() {
    this.socket = new RxWebSocket();
    this.connectionState = new BehaviorSubject<ConnectionStates>(ConnectionStates.CONNECTING);
    this.socket.didOpen = () => this.connectionState.next(ConnectionStates.CONNECTED);
    this.socket.willOpen = () => this.connectionState.next(ConnectionStates.CONNECTING);
    this.socket.didClose = () => this.connectionState.next(ConnectionStates.CLOSED);
    this.connected = new EventEmitter<boolean>();
  }

  connect(): Observable<SocketEvent> {
    return new Observable((subscriber: Subscriber<SocketEvent>) => {
      const sub = this.socket.out.subscribe(subscriber);

      return () => {
        sub.unsubscribe();
      };
    }).pipe(
      share(),
      retryWhen(errors =>
        errors.pipe(
          switchMap(() => {
            this.connectionState.next(ConnectionStates.RETRYING);

            if (navigator.onLine) {
              return timer(3000);
            } else {
              return fromEvent(window, 'online').pipe(take(1));
            }
          })
        )
      )
    );
  }

  onMessage(): Observable<SocketEvent> {
    return this.connect();
  }

  emit(msg: SocketEvent): void {
    const data = typeof msg === 'string' ? msg : JSON.stringify(msg);
    this.socket.in.next(data);
  }
}
