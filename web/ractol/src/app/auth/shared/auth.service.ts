import { Injectable, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subscription, Subject, of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AUTH_TOKEN_DATA, TIMEOUT_FACTOR, Login, UserData, TokenResponse } from './auth.model';
import { delay, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  data: UserData | null;
  authenticated: BehaviorSubject<boolean>;
  jwt = new JwtHelperService();
  events: Subject<string> = new Subject<string>();
  refreshTokenTimeoutSubscription = new Subscription();

  constructor(private http: HttpClient, private router: Router, private location: Location, private ngZone: NgZone) {
    const data = localStorage.getItem(AUTH_TOKEN_DATA);
    this.data = (data && JSON.parse(data)) || null;
    this.authenticated = new BehaviorSubject<boolean>(this.isAuthenticated);

    this.events.subscribe(e => {
      switch (e) {
        case 'token_expires':
          this.refreshTokens()
            .then(() => {
              this.restartRefreshTimer();
            })
            .catch(err => {
              console.log('error refreshing tokens: ', err);
            });
          break;
      }
    });
  }

  get userData(): UserData | null {
    return this.data;
  }

  get accessToken(): string | boolean {
    return this.isAuthenticated ? this.data!.tokens.accessToken : false;
  }

  get refreshToken(): string | boolean {
    return this.isAuthenticated ? this.data!.tokens.refreshToken : false;
  }

  get isAuthenticated(): boolean {
    const status = !!this.data;
    if (!status) {
      this.router.navigate(['/login']);
      this.clearRefreshTimer();
    } else if (this.location.isCurrentPathEqualTo('/login')) {
      this.router.navigate(['/']);
    }

    if (status) {
      this.setupRefreshTimer();
    }

    return status;
  }

  login(tokens: TokenResponse): void {
    this.setUserData(tokens);
    this.authenticated.next(this.isAuthenticated);
    this.router.navigate(['/']);
  }

  logout(): void {
    this.http
      .post<any>('/auth/logout', {}, this.refreshHttpOptions())
      .pipe(
        finalize(() => {
          this.unsetUserData();
          this.authenticated.next(this.isAuthenticated);
        })
      )
      .subscribe(
        () => {
          console.log('successfully logged out');
        },
        err => {
          console.error(err);
        }
      );
  }

  authenticate(data: Login): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/login', data);
  }

  refreshTokens(): Promise<TokenResponse> {
    return new Promise((resolve, reject) => {
      this.http.post<TokenResponse>('/auth/token', {}, this.refreshHttpOptions()).subscribe(
        tokens => {
          console.log('Tokens received: ', tokens);
          this.setUserData(tokens);
          resolve(tokens);
        },
        err => {
          console.log('Error refreshing token: ', err);
          reject(err);
        }
      );
    });
  }

  private setupRefreshTimer(): void {
    if (!this.userData || !this.userData.tokens || !this.userData.tokens.accessToken) {
      return;
    }

    this.clearRefreshTimer();
    this.refreshTokenTimeoutSubscription = of('token_expires')
      .pipe(delay(this.calcTimeout()))
      .subscribe(e => this.events.next(e));
  }

  private restartRefreshTimer(): void {
    this.clearRefreshTimer();
    this.setupRefreshTimer();
  }

  private clearRefreshTimer(): void {
    this.refreshTokenTimeoutSubscription.unsubscribe();
  }

  private refreshHttpOptions() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.refreshToken}` }) };
  }

  private calcTimeout(): number {
    const now = Date.now();
    const exp = this.accessTokenExpiry();
    const delta = (exp - now) * TIMEOUT_FACTOR;
    // console.log('next token auto refresh at: ', new Date(Date.now() + delta));
    return Math.max(0, delta);
  }

  private accessTokenExpiry(): number {
    const decoded = this.jwt.decodeToken(this.userData!.tokens.accessToken);
    return decoded.exp * 1000;
  }

  private setUserData(tokens: TokenResponse): void {
    const token = this.jwt.decodeToken(tokens.accessToken);
    this.data = { ...token, tokens };
    localStorage.setItem(AUTH_TOKEN_DATA, JSON.stringify(this.data));
  }

  private unsetUserData(): void {
    this.data = null;
    localStorage.removeItem(AUTH_TOKEN_DATA);
  }
}
