import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from '../../auth/shared/auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  private refreshTokenInProgress: boolean = false;
  private refreshTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<any>(false);

  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = this.addToken(request);

    return next.handle(request).pipe(
      catchError(error => {
        if (request.url.endsWith('/login') || request.url.endsWith('/token')) {
          if (request.url.endsWith('/token')) {
            return this.auth.logoutRequest();
          }

          return throwError(error);
        }

        if (error.status !== 401) {
          return throwError(error);
        }

        if (this.refreshTokenInProgress) {
          return this.refreshTokenSubject.pipe(
            filter(result => !!result),
            take(1),
            switchMap(() => next.handle(this.addToken(request)))
          );
        } else {
          this.refreshTokenInProgress = true;
          this.refreshTokenSubject.next(false);

          return this.auth.refreshTokens().pipe(
            switchMap(() => {
              this.refreshTokenInProgress = false;
              this.refreshTokenSubject.next(true);

              return next.handle(this.addToken(request));
            }),
            catchError(() => {
              this.refreshTokenInProgress = false;
              return this.auth.logoutRequest();
            })
          );
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.auth.accessToken();
    if (!accessToken || request.url.endsWith('/token')) {
      return request;
    }

    return request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
  }
}

export const TokenInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
  deps: [AuthService]
};
