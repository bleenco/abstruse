import { Injectable, Provider, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelper, tokenNotExpired } from 'angular2-jwt';
import { ApiService } from './api.service';
import { SocketService } from './socket.service';

@Injectable()
export class AuthService {
  jwtHelper: JwtHelper;
  userEvents: EventEmitter<string>;
  loginRequired: boolean;

  constructor(
    private api: ApiService,
    private socket: SocketService,
    private router: Router
  ) {
    this.jwtHelper = new JwtHelper();
    this.userEvents = new EventEmitter<string>();

    this.api.isAppReady().subscribe(ready => {
      if (!ready) {
        this.logout();
        this.router.navigate(['/setup']);
      }
    });
  }

  isLoggedIn(): boolean {
    return (localStorage.getItem('abs-token')) ? true : false;
  }

  login(jwt: string): void {
    localStorage.setItem('abs-token', jwt);
    this.userEvents.emit('login');
    this.socket.emit({ type: 'login', data: localStorage.getItem('abs-token') });
  }

  logout(): void {
    localStorage.removeItem('abs-token');
    this.socket.emit({ type: 'userId', data: null });
    this.socket.emit({ type: 'logout' });
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
