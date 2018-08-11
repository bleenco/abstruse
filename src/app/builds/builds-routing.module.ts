import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuildsComponent } from './builds.component';
import { BuildsLatestComponent } from './builds-latest/builds-latest.component';

const buildsRoutes: Routes = [
  {
    path: '',
    component: BuildsComponent,
    children: [
      { path: '', component: BuildsLatestComponent }
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
