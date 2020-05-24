import { Injectable, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';
import { SocketEvent } from '../models/socket.model';
import { ConnectionStates } from '../models/socket.class';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  socketInput: EventEmitter<SocketEvent>;
  socketOutput: Observable<any>;
  connected: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public socketService: SocketService) {
    this.socketInput = new EventEmitter<SocketEvent>();
    this.socketOutput = this.socketService.onMessage();
    this.socketService.connectionState
      .subscribe(state => {
        if (state === ConnectionStates.CONNECTED) {
          this.connected.next(true);
        } else if (state === ConnectionStates.RETRYING) {
          this.connected.next(false);
        }
      });
    this.socketInput.subscribe((e: SocketEvent) => this.socketService.emit(e));
  }
}
