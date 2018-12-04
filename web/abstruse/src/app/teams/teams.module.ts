import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsListComponent } from './teams-list/teams-list.component';
import { SharedModule } from '../shared/modules/shared.module';

@NgModule({
  imports: [
    CommonModule,
    TeamsRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    TeamsListComponent
  ]
})
export class TeamsModule { }
