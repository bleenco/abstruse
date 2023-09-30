import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Setup } from './setup.model';
import { Observable, lastValueFrom } from 'rxjs';
import { Admin } from './admin.model';

@Injectable({ providedIn: 'root' })
export class SetupService {
  constructor(private http: HttpClient) { }

  saveUser(form: Admin): Observable<void> {
    return this.http.post<void>('/setup/user', form);
  }

  async ready(): Promise<boolean> {
    return lastValueFrom(this.http.get<Setup>('/setup/ready'))
      .then(resp => resp.user)
      .catch(() => false);
  }
}
