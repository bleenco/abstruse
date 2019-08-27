import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuildsComponent } from './builds.component';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';
import { BuildsCurrentComponent } from './builds-current/builds-current.component';

const buildsRoutes: Routes = [
  {
    path: '',
    component: BuildsComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/repositories' },
      { path: ':repoid', component: BuildsCurrentComponent },
      { path: ':repoid/:buildid', component: BuildsDetailsComponent },
      { path: ':repoid/:buildid/:jobid', component: BuildsJobDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(buildsRoutes)],
  exports: [RouterModule]
})
export class BuildsRoutingModule { }
