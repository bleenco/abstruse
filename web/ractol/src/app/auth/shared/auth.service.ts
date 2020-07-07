import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subscription, of, timer, throwError } from 'rxjs';
import * as jwt from 'jwt-decode';
import { AUTH_TOKEN_DATA, TIMEOUT_FACTOR, Login, UserData, TokenResponse } from './auth.model';
import { finalize, flatMap, switchMap, tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  data: UserData | null;
  authenticated: BehaviorSubject<boolean>;

  refreshTokenTimerSubscription = new Subscription();
  refreshTokenInProgress: boolean = false;
  refreshTimerRunning: boolean = false;

  constructor(private http: HttpClient, private router: Router, private location: Location) {
    const data = localStorage.getItem(AUTH_TOKEN_DATA);
    this.data = (data && JSON.parse(data)) || null;
    this.authenticated = new BehaviorSubject<boolean>(this.isAuthenticated);
  }

  get userData(): UserData | null {
    return this.data;
  }

  get isAuthenticated(): boolean {
    const status = !!this.data;
    if (!status) {
      this.cancelRefreshTimer();
    } else {
      if (this.location.isCurrentPathEqualTo('/login')) {
        this.router.navigate(['/']);
      }
      this.startRefreshTimer();
    }

    return status;
  }

  accessToken(): string | boolean {
    return !!this.data ? this.data!.tokens.accessToken : false;
  }

  refreshToken(): string | boolean {
    return !!this.data ? this.data!.tokens.refreshToken : false;
  }

  authenticate(data: Login): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/login', data);
  }

  login(tokens: TokenResponse): void {
    this.setUserData(tokens);
    this.authenticated.next(this.isAuthenticated);
    this.router.navigate(['/']);
  }

  logout(): void {
    this.logoutRequest()
      .pipe(catchError(error => (error.status !== 401 ? throwError(error) : of(null))))
      .subscribe();
  }

  logoutRequest(): Observable<never> {
    const decoded = jwt<any>(this.userData!.tokens.refreshToken);
    const refreshToken = decoded.token;
    return this.http.post<never>('/auth/logout', { refreshToken }, this.refreshHttpOptions()).pipe(
      finalize(() => {
        this.unsetUserData();
        this.authenticated.next(this.isAuthenticated);
        if (!this.location.isCurrentPathEqualTo('/login')) {
          this.router.navigate(['/login']);
        }
      })
    );
  }

  refreshTokens(): Observable<TokenResponse> {
    this.refreshTokenInProgress = true;
    return this.http.post<TokenResponse>('/auth/token', {}, this.refreshHttpOptions()).pipe(
      tap(tokens => {
        this.setUserData(tokens);
        console.log('tokens refreshed succesfully');
      }),
      finalize(() => (this.refreshTokenInProgress = false))
    );
  }

  startRefreshTimer(): void {
    if (this.refreshTimerRunning) {
      return;
    }

    this.refreshTimerRunning = true;
    this.refreshTokenTimerSubscription = of('refresh_token')
      .pipe(
        switchMap(() => timer(this.calcTimeout())),
        switchMap(() =>
          this.refreshTokenInProgress
            ? of(200)
            : this.refreshTokens().pipe(
                flatMap(() => of(200)),
                catchError(error => of(error.status))
              )
        ),
        switchMap(status => (status !== 200 ? this.logoutRequest().pipe(map(() => 'logout')) : of('ok')))
      )
      .subscribe(msg => (msg === 'ok' ? this.restartRefreshTimer() : false));
  }

  restartRefreshTimer(): void {
    this.cancelRefreshTimer();
    this.startRefreshTimer();
  }

  cancelRefreshTimer(): void {
    this.refreshTokenTimerSubscription.unsubscribe();
    this.refreshTimerRunning = false;
  }

  private refreshHttpOptions() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.refreshToken()}` }) };
  }

  private calcTimeout(): number {
    const now = Date.now();
    const exp = this.tokenExpiry();
    const storedAt = (this.data?.tokens.storedAt as number) || now;
    const delta = (exp - storedAt) * TIMEOUT_FACTOR - (now - storedAt);
    console.log('next token auto refresh at: ', new Date(Date.now() + delta));
    return Math.max(0, delta);
  }

  private tokenExpiry(): number {
    const accessToken = jwt<any>(this.userData!.tokens.accessToken);
    const refreshToken = jwt<any>(this.userData!.tokens.refreshToken);
    return Math.min(accessToken.exp, refreshToken.exp) * 1000;
  }

  private setUserData(tokens: TokenResponse): void {
    const token = jwt<any>(tokens.accessToken);
    this.data = { ...token, tokens };
    this.data!.tokens.storedAt = Date.now();
    localStorage.setItem(AUTH_TOKEN_DATA, JSON.stringify(this.data));
  }

  private unsetUserData(): void {
    this.data = null;
    localStorage.removeItem(AUTH_TOKEN_DATA);
  }
}
