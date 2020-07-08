import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { SetupGuardService } from '../setup/shared/setup-guard.service';
import { AuthGuardService } from './shared/auth-guard.service';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  declarations: [LoginComponent],
  providers: [AuthGuardService, SetupGuardService]
})
export class AuthModule {}
