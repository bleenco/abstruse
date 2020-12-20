import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { AUTH_TOKEN_KEY, Login, UserData, TokenResponse } from './auth.model';
import { CookieService } from 'ngx-cookie-service';
import jwtDecode from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  data: UserData | null = null;
  authenticated: BehaviorSubject<boolean>;

  get userData(): UserData | null {
    return this.data;
  }

  get isAuthenticated(): boolean {
    return !!this.data;
  }

  get token(): string | false {
    return localStorage.getItem(AUTH_TOKEN_KEY) || false;
  }

  get isAdmin(): boolean {
    return !!this.data && this.data.role === 'admin';
  }

  constructor(private http: HttpClient, private router: Router, private cookie: CookieService) {
    const data = localStorage.getItem(AUTH_TOKEN_KEY);
    this.data = (data && jwtDecode<any>(data)) || null;
    this.authenticated = new BehaviorSubject<boolean>(this.isAuthenticated);
  }

  login(token: string): void {
    this.setToken(token);
    this.authenticated.next(this.isAuthenticated);
    this.router.navigate(['/']);
  }

  logout(): void {
    this.data = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.cookie.delete(AUTH_TOKEN_KEY);
    this.authenticated.next(this.isAuthenticated);
    this.router.navigate(['/login']);
  }

  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    this.cookie.set(AUTH_TOKEN_KEY, token);
    this.data = jwtDecode<any>(token);
  }

  authenticate(data: Login): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/login', data);
  }
}
