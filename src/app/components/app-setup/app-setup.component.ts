import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

export interface ServerStatus {
  sqlite: boolean;
  docker: boolean;
  dockerRunning: boolean;
}

@Component({
  selector: 'app-setup',
  templateUrl: 'app-setup.component.html'
})
export class AppSetupComponent implements OnInit {
  serverStatus: ServerStatus;

  constructor(private apiService: ApiService) {
    this.serverStatus = {
      sqlite: false,
      docker: false,
      dockerRunning: false
    };
  }

  ngOnInit() {
    this.checkConfiguration();
  }

  checkConfiguration(): void {
    this.apiService.getServerStatus().subscribe((resp: ServerStatus) => {
      this.serverStatus = resp;
    });
  }
}
