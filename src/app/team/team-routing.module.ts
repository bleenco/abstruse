import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeamComponent } from './team.component';

const teamRoutes: Routes = [
  {
    path: '',
    component: TeamComponent,
    children: [
      // { path: '', component: BuildsLatestComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(teamRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class TeamRoutingModule { }
