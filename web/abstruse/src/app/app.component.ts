import { Component, OnInit } from '@angular/core';
import { StatusService } from './shared/providers/status.service';
import { AuthService } from './shared/providers/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(public statusService: StatusService, public authService: AuthService) { }

  ngOnInit() {
    this.statusService.checkStatus();
    this.authService.checkAuthenticated();
  }
}
