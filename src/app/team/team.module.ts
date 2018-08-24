import { NgModule } from '@angular/core';

import { TeamService } from './shared/team.service';

import { TeamRoutingModule } from './team-routing.module';
import { TeamComponent } from './team.component';
import { TeamListComponent } from './team-list/team-list.component';
import { SharedModule } from '../shared/modules/shared.module';
import { TeamUserItemComponent } from './team-user-item/team-user-item.component';

@NgModule({
  imports: [
    TeamRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    TeamComponent,
    TeamListComponent,
    TeamUserItemComponent
  ],
  providers: [TeamService]
})
export class TeamModule { }
