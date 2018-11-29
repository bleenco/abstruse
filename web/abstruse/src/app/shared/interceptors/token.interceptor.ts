import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from '../providers/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: this.auth.getToken()
      }
    });

    return next.handle(request);
  }
}

export const TokenInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true, deps: [AuthService]
};
