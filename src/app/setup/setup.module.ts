import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SetupRoutingModule } from './setup-routing.module';
import { SharedModule } from '../shared/modules/shared.module';

import { SetupService } from './shared/setup.service';

import { SetupComponent } from './setup.component';
import { SetupCheckComponent } from './setup-check/setup-check.component';
import { SetupProgressComponent } from './setup-progress/setup-progress.component';
import { SetupTeamComponent } from './setup-team/setup-team.component';
import { SetupConfigComponent } from './setup-config/setup-config.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SetupRoutingModule,
    SharedModule
  ],
  declarations: [
    SetupComponent,
    SetupCheckComponent,
    SetupProgressComponent,
    SetupTeamComponent,
    SetupConfigComponent
  ],
  providers: [ SetupService ]
})
export class SetupModule { }
