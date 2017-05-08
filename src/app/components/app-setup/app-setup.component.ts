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
  readyToSetup: boolean;
  step: 'config' | 'progress' | 'done';
  terminalInput: string;

  constructor(private apiService: ApiService) {
    this.serverStatus = {
      sqlite: false,
      docker: false,
      dockerRunning: false
    };

    this.readyToSetup = false;
    this.step = 'config';
  }

  ngOnInit() {
    this.checkConfiguration();
  }

  checkConfiguration(): void {
    this.apiService.getServerStatus().subscribe((resp: ServerStatus) => {
      this.serverStatus = resp;
      let i = Object.keys(this.serverStatus).map(key => this.serverStatus[key]).findIndex(x => !x);
      this.readyToSetup = i === -1 ? true : false;
    });
  }

  continue(): void {
    this.step = 'progress';
  }

  terminalOutput(data: string): void {
    if (data === 'ready') {
      this.terminalInput = 'asdasdasdasd';
    }
  }
}
