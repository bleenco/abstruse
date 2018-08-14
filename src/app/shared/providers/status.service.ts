import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  status: 'ready' | 'setup' | 'loading';

  constructor(public http: HttpClient, public router: Router) { }

  checkStatus(): void {
    this.status = 'loading';
    const url = getAPIURL() + `/setup/ready`;

    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('setup/ready'))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          this.status = resp.data;
        }

        const currentUrl: string = this.router.url;
        switch (this.status) {
          case 'setup':
            if (currentUrl === '' || currentUrl === '/') {
              this.router.navigate(['/setup']);
            }
            break;
          case 'ready':
            if (currentUrl.startsWith('/setup')) {
              this.router.navigate(['/login']);
            }
            break;
        }
      });
  }
}
