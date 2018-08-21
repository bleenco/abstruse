import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from './core/not-found/not-found.component';

import { AuthGuardService } from './shared/providers/auth-guard.service';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'builds' },
  { path: 'login', redirectTo: '' },
  { path: 'builds', loadChildren: './builds/builds.module#BuildsModule', canLoad: [AuthGuardService], canActivate: [AuthGuardService] },
  { path: 'images', loadChildren: './images/images.module#ImagesModule', canLoad: [AuthGuardService], canActivate: [AuthGuardService] },
  { path: 'setup', loadChildren: './setup/setup.module#SetupModule' },
  { path: '404', component: NotFoundComponent }
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
