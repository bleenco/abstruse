import { Injectable } from '@angular/core';
import * as jwt from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  tokenName: string;
  userInfo: any = false;

  constructor() {
    this.tokenName = 'abstruse-auth-token';
  }

  login(token: string): void {
    localStorage.setItem(this.tokenName, token);
    this.checkAuthenticated();
  }

  logout(): void {
    localStorage.removeItem(this.tokenName);
    this.checkAuthenticated();
  }

  private checkAuthenticated(): void {
    if (this.hasToken()) {
      this.userInfo = this.decodeToken();
    } else {
      this.userInfo = false;
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenName);
  }

  private decodeToken(): any {
    return jwt(localStorage.getItem(this.tokenName));
  }
}
