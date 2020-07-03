import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildsComponent } from './builds/builds.component';

const routes: Routes = [{ path: 'builds', component: BuildsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildsRoutingModule {}
