import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';

export interface ServerStatus {
  sqlite: boolean;
  docker: boolean;
  dockerRunning: boolean;
}

export interface User {
  email: string;
  fullname: string;
  password: string;
  confirmPassword: string;
  admin: boolean;
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
  user: User;
  terminalOptions:  { size: 'small' | 'large' };

  constructor(
    private apiService: ApiService,
    private socketService: SocketService,
    private router: Router,
    private authService: AuthService
  ) {
    this.serverStatus = {
      sqlite: false,
      docker: false,
      dockerRunning: false
    };

    this.readyToSetup = false;
    this.step = 'config';
    this.loading = true;
    this.terminalOptions = { size: 'small' };
  }

  ngOnInit() {
    this.apiService.isAppReady().delay(1000).subscribe(event => {
      if (event) {
        this.router.navigate(['/login']);
      } else {
        if (this.authService.isLoggedIn()) {
          this.authService.logout();
        }

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
    this.loading = true;
    this.apiService.getDatabaseStatus().delay(2000).subscribe(dbStatus => {
      this.loading = false;
      if (!dbStatus) {
        this.user = { email: '', fullname: '', password: '', confirmPassword: '', admin: true };
        this.apiService.initializeDatabase().subscribe(event => {
          if (event) {
            this.step = 'db';
          }
        });
      } else {
        this.continueToDockerImageBuild();
      }
    });
  }

  continueToDockerImageBuild(): void {
    this.loading = true;
    this.apiService.dockerImageExists().delay(2000).subscribe(exists => {
      this.loading = false;
      if (!exists) {
        this.step = 'docker';
        this.socketService.outputEvents.subscribe(event => {
          if (event.type === 'terminalOutput') {
            if (event.data.type === 'exit') {
              if (event.data.data === 0) {
                this.step = 'done';
              }
            } else {
              this.terminalInput = event.data.data;
            }
          }
        });
        this.socketService.emit({ type: 'initializeDockerImage', data: 'abstruse' });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  createUser(): void {
    this.loading = true;
    this.apiService.createUser(this.user).delay(2000).subscribe(event => {
      this.loading = false;
      if (event) {
        this.continueToDockerImageBuild();
      }
    });
  }
}
