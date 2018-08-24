import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeamComponent } from './team.component';
import { TeamListComponent } from './team-list/team-list.component';

const teamRoutes: Routes = [
  {
    path: '',
    component: TeamComponent,
    children: [
      { path: '', component: TeamListComponent, pathMatch: 'full' },
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
