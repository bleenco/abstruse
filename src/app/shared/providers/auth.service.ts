import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JSONResponse } from '../../core/shared/shared.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { catchError } from 'rxjs/operators';
import * as jwt from 'jwt-decode';
import { Login } from '../../login/login.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  tokenName: string;
  userInfo: any = false;
  demo: boolean;

  constructor(
    public http: HttpClient,
    public router: Router
  ) {
    this.tokenName = 'abstruse-auth-token';
  }

  login(token: string): void {
    localStorage.setItem(this.tokenName, token);
    this.checkAuthenticated();
    if (this.hasToken()) {
      this.router.navigate(['/builds']);
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenName);
    this.checkAuthenticated();
    this.router.navigate(['/login']);
  }

  authenticate(credentials: Login): Observable<JSONResponse> {
    const url = getAPIURL() + `/auth/login`;
    return this.http.post<JSONResponse>(url, credentials)
      .pipe(
        catchError(handleError<JSONResponse>('/auth/login'))
      );
  }

  checkAuthenticated(): void {
    if (this.hasToken()) {
      this.userInfo = this.decodeToken();
    } else {
      this.userInfo = false;
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
