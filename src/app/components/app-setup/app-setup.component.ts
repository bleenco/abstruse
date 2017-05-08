import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

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
  step: 'config' | 'db' | 'docker' | 'done';
  terminalInput: string;
  loading: boolean;

  constructor(
    private apiService: ApiService,
    private socketService: SocketService,
    private router: Router
  ) {
    this.serverStatus = {
      sqlite: false,
      docker: false,
      dockerRunning: false
    };

    this.readyToSetup = false;
    this.step = 'config';
    this.loading = true;
  }

  ngOnInit() {
    this.apiService.isAppReady().delay(1000).subscribe(event => {
      if (event) {
        this.router.navigate(['/login']);
      } else {
        this.checkConfiguration();
      }
    });
  }

  checkConfiguration(): void {
    this.loading = true;
    this.apiService.getServerStatus().delay(1000).subscribe((resp: ServerStatus) => {
      this.serverStatus = resp;
      const i =
        Object.keys(this.serverStatus).map(key => this.serverStatus[key]).findIndex(x => !x);
      this.readyToSetup = i === -1 ? true : false;
      this.loading = false;
    });
  }

  continueToDb(): void {
    this.step = 'db';
  }

  terminalOutput(e: any): void {
    if (e === 'ready') {
      this.socketService.onMessage().skip(2).subscribe(event => {
        if (event.type === 'terminalOutput') {
          this.terminalInput = event.data;
        } else if (event.type === 'terminalExit') {
          if (event.data === 0) {
            this.step = 'done';
          }
        }
      });
      this.socketService.emit({ type: 'data', data: 'initializeDockerImage' });
    } else if (e && e.type && e.type === 'resize') {
      this.socketService.emit({ type: 'resize', data: { cols: e.cols, rows: e.rows }});
    }
  }
}
