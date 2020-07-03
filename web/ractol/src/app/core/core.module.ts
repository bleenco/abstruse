import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { throwIfAlreadyLoaded } from '../shared/shared';
import { AuthService } from '../shared/providers/auth.service';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [LoginComponent, HeaderComponent],
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  exports: [LoginComponent, HeaderComponent],
  providers: [AuthService]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
