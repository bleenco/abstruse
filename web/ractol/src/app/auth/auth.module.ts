import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { SetupGuardService } from '../setup/shared/setup-guard.service';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthGuardService } from './shared/auth-guard.service';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, AuthRoutingModule],
  declarations: [LoginComponent],
  providers: [AuthGuardService, SetupGuardService]
})
export class AuthModule {}
