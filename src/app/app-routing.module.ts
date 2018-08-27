import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from './core/not-found/not-found.component';

import { AuthGuardService } from './shared/providers/auth-guard.service';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'builds'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'builds',
    loadChildren: './builds/builds.module#BuildsModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'repositories',
    loadChildren: './repositories/repositories.module#RepositoriesModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'team',
    loadChildren: './team/team.module#TeamModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'images',
    loadChildren: './images/images.module#ImagesModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'setup',
    loadChildren: './setup/setup.module#SetupModule'
  },
  {
    path: '404',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
