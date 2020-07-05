import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from '../../auth/shared/auth.service';
import { Observable } from 'rxjs';

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
    return next.handle(request);
  }
}

export const TokenInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
  deps: [AuthService]
};
