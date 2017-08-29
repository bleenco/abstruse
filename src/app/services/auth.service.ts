import { Injectable, Provider, EventEmitter } from '@angular/core';
import { JwtHelper, tokenNotExpired } from 'angular2-jwt';
import { ApiService } from './api.service';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper;
  userEvents: EventEmitter<string>;
  loginRequired: boolean;

  constructor(private api: ApiService) {
    this.jwtHelper = new JwtHelper();
    this.userEvents = new EventEmitter<string>();
  }

  isLoggedIn(): boolean {
    return (localStorage.getItem('abs-token')) ? true : false;
  }

  login(jwt: string): void {
    localStorage.setItem('abs-token', jwt);
    this.userEvents.emit('login');
  }

  logout(): void {
    localStorage.removeItem('abs-token');
  }

  getData(): Object {
    if (this.isLoggedIn()) {
      return this.jwtHelper.decodeToken(localStorage.getItem('abs-token'));
    } else {
      return null;
    }
  }

  setLoginRequired(data: boolean): void {
    this.loginRequired = data;
  }

  addNewUser(user: any): any {
    return this.api.createUser(user)
      .toPromise()
      .then(data => data);
  }
}

export const AuthServiceProvider: Provider = {
  provide: AuthService, useClass: AuthService
};
