import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { ApiInterceptorProvider } from './interceptors/api.interceptor';
import { ErrorInterceptorProvider } from './interceptors/error.interceptor';
import { TokenInterceptorProvider } from './interceptors/token.interceptor';
import { HeaderComponent } from './header/header.component';
import { AuthService } from '../auth/shared/auth.service';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  exports: [HeaderComponent],
  providers: [AuthService, ApiInterceptorProvider, ErrorInterceptorProvider, TokenInterceptorProvider]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(`${parentModule} has already been loaded. Import Core modules in the AppModule only.`);
    }
  }
}
