import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Setup } from './setup.model';

@Injectable({ providedIn: 'root' })
export class SetupService {
  constructor(private http: HttpClient) {}

  ready(): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get<Setup>('/setup/ready').subscribe(
        resp => {
          if (resp.database && resp.user) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        () => {
          resolve(false);
        }
      );
    });
  }
}
