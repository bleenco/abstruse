import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared';
import { AuthGuardService } from './shared/auth-guard.service';
import { AlreadyAuthGuardService } from './shared/already-auth-guard.service';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  declarations: [LoginComponent],
  providers: [AuthGuardService, AlreadyAuthGuardService]
})
export class AuthModule {}
