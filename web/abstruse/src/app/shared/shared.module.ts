import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';
import { TokenInterceptorProvider } from './interceptors/token.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { AuthGuardService } from './providers/auth-guard.service';
import { StatusService } from './providers/status.service';
import { TimeService } from './providers/time.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  declarations: [],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        TokenInterceptorProvider,
        HttpErrorInterceptor,
        AuthGuardService,
        StatusService,
        TimeService,
        CookieService
      ]
    };
  }
}
