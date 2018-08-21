import { NgModule } from '@angular/core';

import { TeamRoutingModule } from './team-routing.module';
import { TeamComponent } from './team.component';

@NgModule({
  imports: [
    TeamRoutingModule,
  ],
  declarations: [
    TeamComponent
  ],
  providers: []
})
export class TeamModule { }
