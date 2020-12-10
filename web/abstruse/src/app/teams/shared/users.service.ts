import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateUser, User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get('/users').pipe(map((resp: any) => (resp && resp.length ? resp.map(generateUser) : [])));
  }
}
