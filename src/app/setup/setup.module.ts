import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SetupRoutingModule } from './setup-routing.module';
import { SharedModule } from '../shared/modules/shared.module';

import { SetupService } from './shared/setup.service';

import { SetupComponent } from './setup.component';
import { SetupCheckComponent } from './setup-check/setup-check.component';
import { SetupProgressComponent } from './setup-progress/setup-progress.component';
import { SetupTeamComponent } from './setup-team/setup-team.component';

@NgModule({
  imports: [
    CommonModule,
    SetupRoutingModule,
    SharedModule
  ],
  declarations: [
    SetupComponent,
    SetupCheckComponent,
    SetupProgressComponent,
    SetupTeamComponent
  ],
  providers: [ SetupService ]
})
export class SetupModule { }
