import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuardService } from './auth/shared/auth-guard.service';
import { SetupGuardService } from './setup/shared/setup-guard.service';
import { SetupDoneGuardService } from './setup/shared/setup-done-guard.service';
import { NotFoundComponent, GatewayTimeoutComponent } from './core';
import { AlreadyAuthGuardService } from './auth/shared/already-auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'builds', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [SetupGuardService, AlreadyAuthGuardService] },
  {
    path: 'setup',
    loadChildren: () => import('./setup/setup.module').then(m => m.SetupModule),
    canActivate: [SetupDoneGuardService]
  },
  {
    path: 'system',
    loadChildren: () => import('./system/system.module').then(m => m.SystemModule),
    canLoad: [AuthGuardService]
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'gateway-timeout', component: GatewayTimeoutComponent },
  { path: '**', redirectTo: 'builds' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
