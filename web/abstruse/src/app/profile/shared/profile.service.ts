import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Session, generateSession } from './session.model';
import { Password } from './password.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  findSessions(): Observable<Session[]> {
    return this.http.get<Session[]>('/users/sessions').pipe(map(data => data.map(generateSession)));
  }

  updatePassword(data: Password): Observable<void> {
    return this.http.put<void>('/users/password', data);
  }
}
