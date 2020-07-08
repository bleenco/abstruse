import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildsComponent } from './builds/builds.component';
import { AuthGuardService } from '../auth/shared/auth-guard.service';

const routes: Routes = [{ path: 'builds', component: BuildsComponent, canActivate: [AuthGuardService] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildsRoutingModule {}
