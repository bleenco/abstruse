import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './shared/providers/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'builds'
  },
  {
    path: 'builds',
    loadChildren: './builds/builds.module#BuildsModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'repositories',
    loadChildren: './repositories/repositories.module#RepositoriesModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
