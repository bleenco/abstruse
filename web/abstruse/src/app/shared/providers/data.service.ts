import { Injectable, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';
import { SocketEvent } from '../models/socket.model';
import { ConnectionStates } from '../models/socket.class';

@Injectable({ providedIn: 'root' })
export class DataService {
  socketInput: EventEmitter<SocketEvent>;
  socketOutput: Observable<SocketEvent>;
  connected: EventEmitter<boolean> = new EventEmitter<boolean>();
  subEvents: string[] = [];

  constructor(public socketService: SocketService) {
    this.socketInput = new EventEmitter<SocketEvent>();
    this.socketOutput = this.socketService.onMessage();
    this.socketService.connectionState.subscribe(state => {
      if (state === ConnectionStates.CONNECTED) {
        this.connected.next(true);
      } else if (state === ConnectionStates.RETRYING) {
        this.connected.next(false);
      }
    });
    this.socketInput.subscribe((e: SocketEvent) => this.socketService.emit(e));
  }

  subscribeToEvent(event: string): void {
    this.socketInput.emit({ type: 'subscribe', data: { sub: event } });
    this.subEvents.push(event);
  }

  unsubscribeFromEvent(event: string): void {
    this.socketInput.emit({ type: 'unsubscribe', data: { sub: event } });
    this.subEvents = this.subEvents.filter(ev => ev !== event);
  }

  unsubscribeAll(): void {
    this.subEvents.forEach(ev => this.unsubscribeFromEvent(ev));
    this.subEvents = [];
  }
}
