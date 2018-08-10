import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SetupComponent } from './setup.component';
import { SetupCheckComponent } from './setup-check/setup-check.component';
import { SetupConfigComponent } from './setup-config/setup-config.component';
import { SetupTeamComponent } from './setup-team/setup-team.component';

const setupRoutes: Routes = [
  {
    path: '',
    component: SetupComponent,
    children: [
      { path: '', redirectTo: 'check', pathMatch: 'full' },
      { path: 'check', component: SetupCheckComponent },
      { path: 'config', component: SetupConfigComponent },
      { path: 'team', component: SetupTeamComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(setupRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SetupRoutingModule { }
