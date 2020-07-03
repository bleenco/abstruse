import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AUTH_TOKEN_KEY, Login, Credentials } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  creds: Credentials | null;
  authenticated$: BehaviorSubject<boolean>;

  constructor(private http: HttpClient, private router: Router, private location: Location) {
    const creds = sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    this.creds = (creds && JSON.parse(creds)) || null;
    this.authenticated$ = new BehaviorSubject<boolean>(this.isAuthenticated);
  }

  get credentials(): Credentials | null {
    return this.creds;
  }

  get token(): string | boolean {
    return this.isAuthenticated ? this.creds!.token : false;
  }

  get isAuthenticated(): boolean {
    const status = !!this.creds;
    if (!status) {
      this.router.navigate(['/login']);
    } else if (this.location.isCurrentPathEqualTo('/login')) {
      this.router.navigate(['/']);
    }
    return status;
  }

  login(creds: Credentials, remember: boolean = false): void {
    this.setCredentials(creds, remember);
    this.authenticated$.next(this.isAuthenticated);
    this.router.navigate(['/']);
  }

  logout(): void {
    this.unsetCredentials();
    this.authenticated$.next(this.isAuthenticated);
  }

  authenticate(data: Login): Observable<Credentials> {
    return this.http.post<Credentials>('/users/login', data);
  }

  private setCredentials(creds: Credentials, remember: boolean): void {
    this.creds = creds;
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, JSON.stringify(creds));
  }

  private unsetCredentials(): void {
    this.creds = null;
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}
