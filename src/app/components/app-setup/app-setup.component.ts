import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { delay } from 'rxjs/operators';

export interface ServerStatus {
  sqlite: boolean;
  docker: boolean;
  dockerRunning: boolean;
  git: boolean;
}

export interface User {
  email: string;
  fullname: string;
  password: string;
  confirmPassword: string;
  admin: boolean;
}

export interface Secrets {
  api_secret: string;
  jwt_secret: string;
}

@Component({
  selector: 'app-setup',
  templateUrl: 'app-setup.component.html'
})
export class AppSetupComponent implements OnInit {
  serverStatus: ServerStatus;
  readyToSetup: boolean;
  step: 'config' | 'secrets' | 'db' | 'done';
  terminalInput: string;
  loading: boolean;
  user: User;
  terminalOptions:  { size: 'small' | 'large' };
  secrets: Secrets = { api_secret: '', jwt_secret: '' };

  constructor(
    private apiService: ApiService,
    private socketService: SocketService,
    private router: Router,
    private authService: AuthService
  ) {
    this.serverStatus = {
      sqlite: false,
      docker: false,
      dockerRunning: false,
      git: false
    };

    this.readyToSetup = false;
    this.step = 'config';
    this.loading = true;
    this.terminalOptions = { size: 'small' };
  }

  ngOnInit() {
    this.apiService.isAppReady()
      .pipe(delay(250))
      .subscribe(event => {
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
    this.apiService.getServerStatus()
      .pipe(delay(250))
      .subscribe((resp: ServerStatus) => {
        this.serverStatus = resp;
        const i = Object.keys(this.serverStatus).map(key => this.serverStatus[key]).findIndex(x => !x);
        this.readyToSetup = i === -1 ? true : false;
        this.loading = false;
      });
  }

  continueToSecrets(): void {
    this.loading = true;
    this.apiService.getSetupConfig().subscribe(resp => {
      this.secrets.api_secret = resp.secret;
      this.secrets.jwt_secret = resp.jwtSecret;
      this.loading = false;
      this.step = 'secrets';
    });
  }

  saveSecrets(): void {
    this.loading = true;
    this.apiService.saveSetupConfig(this.secrets).subscribe(resp => {
      this.continueToDb();
    });
  }

  continueToDb(): void {
    this.loading = true;
    this.apiService.getDatabaseStatus()
      .pipe(delay(250))
      .subscribe(dbStatus => {
        this.loading = false;
        if (!dbStatus) {
          this.user = { email: '', fullname: '', password: '', confirmPassword: '', admin: true };
          this.apiService.initializeDatabase().subscribe(event => {
            if (event) {
              this.step = 'db';
            }
          });

          this.apiService.buildAbstruseBaseImage().subscribe(() => {});
        } else {
          this.loading = false;
          this.step = 'done';
        }
      });
  }

  createUser(): void {
    this.loading = true;
    this.apiService.createUser(this.user)
      .pipe(delay(250))
      .subscribe(event => {
        this.loading = false;
        if (event) {
          this.step = 'done';
        }
      });
  }
}
