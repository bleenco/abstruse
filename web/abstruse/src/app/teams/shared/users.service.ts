import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokenResponse } from 'src/app/auth/shared/auth.model';
import { generateUser, User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http
      .get('/users')
      .pipe(map((resp: any) => (resp && resp.length ? resp.map(generateUser) : [])));
  }

  create(data: any): Observable<User> {
    return this.http.post<User>('/users', data);
  }

  update(data: any): Observable<TokenResponse> {
    return this.http.put<TokenResponse>('/users', data);
  }
}
