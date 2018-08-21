import { NgModule } from '@angular/core';

import { SetupRoutingModule } from './setup-routing.module';
import { SharedModule } from '../shared/modules/shared.module';

import { SetupService } from './shared/setup.service';

import { SetupComponent } from './setup.component';
import { SetupCheckComponent } from './setup-check/setup-check.component';
import { SetupProgressComponent } from './setup-progress/setup-progress.component';
import { SetupTeamComponent } from './setup-team/setup-team.component';
import { SetupConfigComponent } from './setup-config/setup-config.component';
import { SetupUserComponent } from './setup-user/setup-user.component';
import { SetupUserDialogComponent } from './setup-user-dialog/setup-user-dialog.component';

@NgModule({
  imports: [
    SetupRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    SetupComponent,
    SetupCheckComponent,
    SetupProgressComponent,
    SetupTeamComponent,
    SetupConfigComponent,
    SetupUserComponent,
    SetupUserDialogComponent
  ],
  providers: [ SetupService ]
})
export class SetupModule { }
