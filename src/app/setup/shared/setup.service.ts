import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { SetupStatus, SetupConfig } from './setup.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  status: SetupStatus;
  config: SetupConfig;
  fetchingRequirements: boolean;
  fetchingConfig: boolean;

  constructor(
    public http: HttpClient,
    public router: Router
  ) {
    this.config = new SetupConfig();
  }

  next(): void {
    const route = this.router.url;

    switch (route) {
      case '/setup/check': this.router.navigate(['/setup/config']); break;
      case '/setup/config': this.router.navigate(['/setup/team']); break;
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
