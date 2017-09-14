import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'app-dashboard.component.html'
})
export class AppDashboardComponent implements OnInit, OnDestroy {
  loading: boolean;

  constructor(private socketService: SocketService) {
    this.loading = true;
  }

  ngOnInit() {
    this.loading = false;
  }

  ngOnDestroy() {

  }
}
