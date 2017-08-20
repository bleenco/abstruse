import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { SocketService } from './services/socket.service';
import { ConnectionStates } from './classes/rx-web-socket.class';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  connected: boolean;
  state: ConnectionStates;
  routing: boolean;

  constructor(private socketService: SocketService, private router: Router) { }

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

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.routing = true;
      } else if (event instanceof NavigationEnd) {
        this.routing = false;
      }
    });
  }
}
