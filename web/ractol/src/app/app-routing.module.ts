import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuardService } from './auth/shared/auth-guard.service';
import { SetupGuardService } from './setup/shared/setup-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'builds', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [SetupGuardService] },
  {
    path: 'system',
    loadChildren: () => import('./system/system.module').then(m => m.SystemModule),
    canLoad: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
