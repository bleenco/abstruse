import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'app-dashboard.component.html'
})
export class AppDashboardComponent {

  constructor(private socketService: SocketService) { }

}
