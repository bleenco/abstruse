import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL } from '../../core/shared/shared-functions';
import * as jwt from 'jwt-decode';
import { Login } from '../../login/login.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  tokenName: string;
  userInfo: any = false;
  authenticated$: BehaviorSubject<boolean>;

  constructor(
    public http: HttpClient,
    public router: Router
  ) {
    this.tokenName = 'abstruse-auth-token';
    this.authenticated$ = new BehaviorSubject<boolean>(false);
  }

  get isLoggedIn() {
    return this.authenticated$.asObservable();
  }

  login(token: string): void {
    localStorage.setItem(this.tokenName, token);
    if (this.hasToken()) {
      this.checkAuthenticated();
      this.router.navigate(['/builds']);
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenName);
    this.checkAuthenticated();
    this.router.navigate(['/login']);
  }

  authenticate(credentials: Login): Observable<JSONResponse> {
    const url = getAPIURL() + `/user/login`;
    return this.http.post<JSONResponse>(url, credentials);
  }

  checkAuthenticated(): void {
    if (this.hasToken()) {
      this.userInfo = this.decodeToken();
      this.authenticated$.next(true);
    } else {
      this.userInfo = false;
      this.authenticated$.next(false);
    }
  }

  getToken(): string {
    return localStorage.getItem(this.tokenName) || '';
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenName);
  }

  private decodeToken(): any {
    return jwt(localStorage.getItem(this.tokenName));
  }
}
