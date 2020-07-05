import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AUTH_TOKEN_DATA, TIMEOUT_FACTOR, Login, UserData, TokenResponse } from './auth.model';
import { tap, delay, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  data: UserData | null;
  authenticated$: BehaviorSubject<boolean>;
  jwt = new JwtHelperService();
  refresh$ = new BehaviorSubject<void>(void 0);
  refreshSub = new Subscription();

  constructor(private http: HttpClient, private router: Router, private location: Location) {
    const data = localStorage.getItem(AUTH_TOKEN_DATA);
    this.data = (data && JSON.parse(data)) || null;
    this.authenticated$ = new BehaviorSubject<boolean>(this.isAuthenticated);
  }

  get userData(): UserData | null {
    return this.data;
  }

  get userToken(): string | boolean {
    return this.isAuthenticated ? this.data!.tokens.token : false;
  }

  get refreshToken(): string | boolean {
    return this.isAuthenticated ? this.data!.tokens.refreshToken : false;
  }

  get isAuthenticated(): boolean {
    const status = !!this.data;
    if (!status) {
      this.router.navigate(['/login']);
    } else if (this.location.isCurrentPathEqualTo('/login')) {
      this.router.navigate(['/']);
    }

    if (!status) {
      this.refreshSub.unsubscribe();
    } else {
      this.refreshSub = this.setupAutoRefreshTimer();
    }

    return status;
  }

  login(tokens: TokenResponse): void {
    this.setUserData(tokens);
    this.authenticated$.next(this.isAuthenticated);
    this.router.navigate(['/']);
  }

  logout(): void {
    this.unsetUserData();
    this.authenticated$.next(this.isAuthenticated);
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.refreshToken}`
      })
    };
    this.http.post<{}>('/auth/logout', {}, options).subscribe();
  }

  authenticate(data: Login): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/login', data);
  }

  refreshTokens(): Observable<TokenResponse> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.refreshToken}`
      })
    };

    return this.http.post<TokenResponse>('/auth/token', {}, options).pipe(tap(tokens => this.setUserData(tokens)));
  }

  private setupAutoRefreshTimer(): Subscription {
    return this.refresh$
      .pipe(
        delay(this.calcTimeout()),
        mergeMap(() => this.refreshTokens())
      )
      .subscribe(
        () => {
          this.refresh$.next();
        },
        err => {
          console.error(err);
        }
      );
  }

  private calcTimeout(): number {
    const now = Date.now();
    const exp = this.refreshTokenExpiry();
    const delta = (exp - now) * TIMEOUT_FACTOR;
    // console.log('next token auto refresh at: ', new Date(Date.now() + delta));
    return Math.max(0, delta);
  }

  private refreshTokenExpiry(): number {
    const decoded = this.jwt.decodeToken(this.userData!.tokens.refreshToken);
    return decoded.exp * 1000;
  }

  private setUserData(tokens: TokenResponse): void {
    const token = this.jwt.decodeToken(tokens.token);
    this.data = { ...token, tokens };
    localStorage.setItem(AUTH_TOKEN_DATA, JSON.stringify(this.data));
  }

  private unsetUserData(): void {
    this.data = null;
    localStorage.removeItem(AUTH_TOKEN_DATA);
  }
}
