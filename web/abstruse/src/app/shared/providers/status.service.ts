import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL } from '../../core/shared/shared-functions';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  status: 'ready' | 'setup' | 'loading';
  status$: BehaviorSubject<'ready' | 'setup' | 'loading'>;

  constructor(public http: HttpClient, public router: Router) {
    this.status$ = new BehaviorSubject<'ready' | 'setup' | 'loading'>('loading');
  }

  checkStatus(): void {
    this.status = 'loading';
    const url = getAPIURL() + `/setup/ready`;

    this.http.get<JSONResponse>(url).subscribe(resp => {
      if (resp && resp.data) {
        this.status = resp.data;
        this.status$.next(this.status);
      }

      const currentUrl: string = this.router.url;
      switch (this.status) {
        case 'setup':
          if (currentUrl === '' || currentUrl === '/' || currentUrl === '/login') {
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
