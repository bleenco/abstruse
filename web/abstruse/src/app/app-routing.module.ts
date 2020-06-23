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
    loadChildren: () => import('./builds/builds.module').then(m => m.BuildsModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'repos',
    loadChildren: () => import('./repos/repos.module').then(m => m.ReposModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'teams',
    loadChildren: () => import('./teams/teams.module').then(m => m.TeamsModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'workers',
    loadChildren: () => import('./workers/workers.module').then(m => m.WorkersModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'images',
    loadChildren: () => import('./images/images.module').then(m => m.ImagesModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'providers',
    loadChildren: () => import('./providers/providers.module').then(m => m.ProvidersModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
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
export class AppRoutingModule {}
