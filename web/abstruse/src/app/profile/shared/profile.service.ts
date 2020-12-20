import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Password } from './password.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Profile, User, generateUser } from '../../teams/shared/user.model';
import { TokenResponse } from 'src/app/auth/shared/auth.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  findProfile(): Observable<User> {
    return this.http.get<User>('/users/profile').pipe(map(generateUser));
  }

  updateProfile(data: Profile): Observable<TokenResponse> {
    return this.http.put<TokenResponse>('/users/profile', data);
  }

  updatePassword(data: Password): Observable<void> {
    return this.http.put<void>('/users/password', data);
  }
}
