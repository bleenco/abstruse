import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuardService } from './auth/shared/auth-guard.service';
import { SetupDoneGuardService } from './setup/shared/setup-done-guard.service';
import { NotFoundComponent, GatewayTimeoutComponent } from './core';
import { AlreadyAuthGuardService } from './auth/shared/already-auth-guard.service';
import { QuicklinkModule, QuicklinkStrategy } from 'ngx-quicklink';

const routes: Routes = [
  { path: '', redirectTo: 'builds', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AlreadyAuthGuardService] },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule),
    canLoad: [AuthGuardService]
  },
  {
    path: 'providers',
    loadChildren: () => import('./providers/providers.module').then(m => m.ProvidersModule),
    canLoad: [AuthGuardService]
  },
  {
    path: 'repos',
    loadChildren: () => import('./repos/repos.module').then(m => m.ReposModule),
    canLoad: [AuthGuardService]
  },
  {
    path: 'workers',
    loadChildren: () => import('./workers/workers.module').then(m => m.WorkersModule),
    canLoad: [AuthGuardService]
  },
  {
    path: 'teams',
    loadChildren: () => import('./teams/teams.module').then(m => m.TeamsModule),
    canLoad: [AuthGuardService]
  },
  {
    path: 'images',
    loadChildren: () => import('./images/images.module').then(m => m.ImagesModule),
    canLoad: [AuthGuardService]
  },
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
  { path: 'gateway-timeout', component: GatewayTimeoutComponent }
];

@NgModule({
  imports: [QuicklinkModule, RouterModule.forRoot(routes, { preloadingStrategy: QuicklinkStrategy })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
