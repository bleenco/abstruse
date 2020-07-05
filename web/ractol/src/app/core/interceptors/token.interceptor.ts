import { Injectable, Provider } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
  HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from '../../auth/shared/auth.service';
import { Observable, empty, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.headers.has('Authorization')) {
      return next.handle(request);
    }

    if (this.auth.userToken) {
      request = request.clone({ setHeaders: { Authorization: `Bearer ${this.auth.userToken}` } });
    }

    return next.handle(request).pipe(
      catchError(error => {
        return this.handleResponseError(error, request, next);
      })
    );
  }

  private handleResponseError(
    error: HttpErrorResponse,
    request?: HttpRequest<any>,
    next?: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (error.status === 401) {
      return this.auth.refreshTokens().pipe(
        switchMap(() => {
          request = request!.clone({ setHeaders: { Authorization: `Bearer ${this.auth.userToken}` } });
          return next!.handle(request);
        }),
        catchError(err => {
          if (err.status === 401) {
            this.auth.logout();
          } else {
            return this.handleResponseError(err);
          }
          throw err;
        })
      );
    } else if (error.status === 403 || error.status === 500) {
      this.auth.logout();
    }

    return throwError(error);
  }
}

export const TokenInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
  deps: [AuthService]
};
