import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsIntegrationsComponent } from './settings-integrations/settings-integrations.component';
import { SettingsIntegrationDialogComponent } from './settings-integration-dialog/settings-integration-dialog.component';
import { FormsModule } from '@angular/forms';
import { IntegrationService } from './shared/integration.service';
import { SettingsIntegrationItemComponent } from './settings-integration-item/settings-integration-item.component';
import { SettingsIntegrationDetailsComponent } from './settings-integration-details/settings-integration-details.component';
import { SettingsIntegrationRepoItemComponent } from './settings-integration-repo-item/settings-integration-repo-item.component';
import { SharedModule } from '../shared/modules/shared.module';
import { SettingsPersonalComponent } from './settings-personal/settings-personal.component';
import { PersonalService } from './shared/personal.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SettingsRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    SettingsIntegrationsComponent,
    SettingsIntegrationDialogComponent,
    SettingsIntegrationItemComponent,
    SettingsIntegrationDetailsComponent,
    SettingsIntegrationRepoItemComponent,
    SettingsPersonalComponent
  ],
  providers: [IntegrationService, PersonalService]
})
export class SettingsModule { }
