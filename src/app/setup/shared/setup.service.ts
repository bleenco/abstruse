import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { SetupStatus } from './setup.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  status: SetupStatus;
  fetchingRequirements: boolean;

  constructor(
    public http: HttpClient,
    public router: Router
  ) { }

  next(): void {
    const route = this.router.url;

    switch (route) {
      case '/setup/check': this.router.navigate(['/setup/config']); break;
      case '/setup/config': this.router.navigate(['/setup/team']); break;
    }
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
