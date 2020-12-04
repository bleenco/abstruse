import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Setup } from './setup.model';
import { Observable } from 'rxjs';
import { Admin } from './admin.model';

@Injectable({ providedIn: 'root' })
export class SetupService {
  constructor(private http: HttpClient, private router: Router) {}

  saveUser(form: Admin): Observable<void> {
    return this.http.post<void>('/setup/user', form);
  }

  async ready(): Promise<boolean> {
    return this.http
      .get<Setup>('/setup/ready')
      .toPromise()
      .then(resp => resp.user)
      .catch(() => false);
  }
}
