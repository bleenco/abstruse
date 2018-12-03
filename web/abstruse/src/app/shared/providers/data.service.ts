import { Injectable, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  socketInput: EventEmitter<any>;
  socketOutput: Observable<any>;

  constructor(public socketService: SocketService) {
    this.socketInput = new EventEmitter<any>();
    this.socketOutput = this.socketService.onMessage();
    this.socketInput.subscribe(event => this.socketService.emit(event));
  }
}
