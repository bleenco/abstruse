import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuildsComponent } from './builds.component';
import { BuildsLatestComponent } from './builds-latest/builds-latest.component';
import { BuildDetailsComponent } from './build-details/build-details.component';

const buildsRoutes: Routes = [
  {
    path: '',
    component: BuildsComponent,
    children: [
      { path: '', component: BuildsLatestComponent },
      { path: ':id', component: BuildDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(buildsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BuildsRoutingModule { }
