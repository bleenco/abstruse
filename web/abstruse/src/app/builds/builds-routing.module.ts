import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuildsComponent } from './builds.component';
import { BuildsLatestComponent } from './builds-latest/builds-latest.component';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';

const buildsRoutes: Routes = [
  {
    path: '',
    component: BuildsComponent,
    children: [
      { path: '', component: BuildsLatestComponent, pathMatch: 'full' },
      { path: ':id', component: BuildsDetailsComponent },
      { path: ':id/:jobid', component: BuildsJobDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(buildsRoutes)],
  exports: [RouterModule]
})
export class BuildsRoutingModule { }
