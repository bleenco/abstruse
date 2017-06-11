import { Injectable, Provider } from '@angular/core';
import { JwtHelper, tokenNotExpired } from 'angular2-jwt';
import { ApiService } from './api.service';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper;

  constructor(private api: ApiService) {
    this.jwtHelper = new JwtHelper();
  }

  isLoggedIn(): boolean {
    return (localStorage.getItem('abs-token')) ? true : false;
  }

  login(jwt: string): void {
    localStorage.setItem('abs-token', jwt);
  }

  logout(): void {
    localStorage.removeItem('abs-token');
  }

  getData(): Object {
    return this.jwtHelper.decodeToken(localStorage.getItem('abs-token'));
  }
}

export const AuthServiceProvider: Provider = {
  provide: AuthService, useClass: AuthService
};
