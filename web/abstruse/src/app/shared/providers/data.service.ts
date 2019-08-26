import { Injectable, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';
import { SocketEvent } from '../models/socket.model';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  socketInput: EventEmitter<SocketEvent>;
  socketOutput: Observable<any>;

  constructor(public socketService: SocketService) {
    this.socketInput = new EventEmitter<SocketEvent>();
    this.socketOutput = this.socketService.onMessage();
    this.socketInput.subscribe((e: SocketEvent) => this.socketService.emit(e));
  }
}
