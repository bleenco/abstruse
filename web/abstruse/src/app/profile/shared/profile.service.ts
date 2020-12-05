import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Password } from './password.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Profile, User, generateUser } from '../../users/shared/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  findProfile(): Observable<User> {
    return this.http.get<User>('/users/profile').pipe(map(generateUser));
  }

  updateProfile(data: Profile): Observable<User> {
    return this.http.put<User>('/users/profile', data).pipe(map(generateUser));
  }

  updatePassword(data: Password): Observable<void> {
    return this.http.put<void>('/users/password', data);
  }
}
