import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StatusService } from '../../shared/providers/status.service';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { SetupStatus, SetupConfig } from './setup.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../core/shared/user.model';
import { getAvatars } from '../../core/shared/shared-functions';

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  status: SetupStatus;
  config: SetupConfig;
  fetchingRequirements: boolean;
  fetchingConfig: boolean;
  avatars: string[];
  userTypes: { value: boolean, placeholder: string }[] = [
    { value: false, placeholder: 'User' },
    { value: true, placeholder: 'Administrator' }
  ];
  userDialogOpened: boolean;
  users: User[] = [];
  fetchingUsers: boolean;

  constructor(
    public http: HttpClient,
    public router: Router,
    public statusService: StatusService
  ) {
    this.config = new SetupConfig();
    this.avatars = getAvatars();
  }

  next(): void {
    const route = this.router.url;

    switch (route) {
      case '/setup/check': this.router.navigate(['/setup/config']); break;
      case '/setup/config': this.router.navigate(['/setup/user']); break;
      case '/setup/user': this.router.navigate(['/setup/team']); break;
    }
  }

  fetchConfig(): void {
    this.fetchingConfig = true;
    const url = getAPIURL() + `/setup/config`;

    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('setup/config'))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          this.config = new SetupConfig(
            resp.data.secret,
            resp.data.jwtSecret,
            resp.data.concurrency,
            resp.data.idleTimeout,
            resp.data.jobTimeout
          );
        }
        this.fetchingConfig = false;
      });
  }

  saveConfig(): Observable<JSONResponse> {
    const url = getAPIURL() + `/setup/config`;

    return this.http.post<JSONResponse>(url, this.config)
      .pipe(
        catchError(handleError<JSONResponse>('setup/config'))
      );
  }

  createUser(user: User): Observable<JSONResponse> {
    const url = getAPIURL() + `/users/new`;

    return this.http.post<JSONResponse>(url, user)
      .pipe(
        catchError(handleError<JSONResponse>('users/new'))
      );
  }

  fetchUsers(): void {
    this.fetchingUsers = true;
    const url = getAPIURL() + `/users`;

    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('/users'))
      )
      .subscribe(resp => {
        if (resp && resp.data && resp.data.length) {
          this.users = resp.data.map(user => new User(user.email, user.fullname, '', '', user.avatar, Boolean(user.admin)));
        }
        this.fetchingUsers = false;
      });
  }

  checkRequirements(): void {
    this.resetStatus();
    this.fetchingRequirements = true;
    const url = getAPIURL() + `/setup/status`;

    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('setup/status'))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          this.status.requirements = resp.data;
        }
        this.fetchingRequirements = false;
      });
  }

  setSetupDone(): Observable<JSONResponse> {
    const url = getAPIURL() + `/setup/done`;
    return this.http.post<JSONResponse>(url, null)
      .pipe(
        catchError(handleError<JSONResponse>('setup/done'))
      );
  }

  goToLogin(): void {
    this.statusService.checkStatus();
  }

  openUserDialog(): void {
    this.userDialogOpened = true;
  }

  closeUserDialog(): void {
    this.userDialogOpened = false;
  }

  generateRandomString(len: number): string {
    const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array(len).join().split(',').map(() => s.charAt(Math.floor(Math.random() * s.length))).join('');
  }

  private resetStatus(): void {
    this.status = {
      requirements: {
        git: { status: false, version: '' },
        sqlite: { status: false, version: '' },
        docker: { status: false, version: '' },
        dockerRunning: { status: false }
      }
    };
  }
}
