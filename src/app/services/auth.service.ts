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
    return (sessionStorage.getItem('abs-token')) ? true : false;
  }

  login(jwt: string): void {
    sessionStorage.setItem('abs-token', jwt);
  }

  logout(): void {
    sessionStorage.removeItem('abs-token');
  }
}

export const AuthServiceProvider: Provider = {
  provide: AuthService, useClass: AuthService
};
