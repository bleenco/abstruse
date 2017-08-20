import { Component, OnInit } from '@angular/core';
import { SocketService } from './services/socket.service';
import { ConnectionStates } from './classes/rx-web-socket.class';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  connected: boolean;
  state: ConnectionStates;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.socketService.connectionState
      .subscribe(state => {
        this.state = state;

        if (state === ConnectionStates.CONNECTED) {
          this.connected = true;
        } else {
          this.connected = false;
        }
      });
  }
}
