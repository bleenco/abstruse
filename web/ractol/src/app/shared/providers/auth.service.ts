import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AUTH_TOKEN_KEY } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticated$: BehaviorSubject<boolean>;

  constructor(private http: HttpClient, private router: Router) {
    this.authenticated$ = new BehaviorSubject<boolean>(this.checkToken);
  }

  get token(): string | boolean {
    return localStorage.getItem(AUTH_TOKEN_KEY) || false;
  }

  login(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    this.authenticated$.next(this.checkToken);
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.authenticated$.next(this.checkToken);
  }

  private get checkToken(): boolean {
    const status = !!localStorage.getItem(AUTH_TOKEN_KEY);
    this.router.navigate([status ? '/' : '/login']);
    return status;
  }
}
