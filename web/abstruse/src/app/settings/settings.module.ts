import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsIntegrationsComponent } from './settings-integrations/settings-integrations.component';
import { SettingsIntegrationDialogComponent } from './settings-integration-dialog/settings-integration-dialog.component';
import { FormsModule } from '@angular/forms';
import { IntegrationService } from './shared/integration.service';
import { SettingsIntegrationItemComponent } from './settings-integration-item/settings-integration-item.component';
import { SettingsIntegrationDetailsComponent } from './settings-integration-details/settings-integration-details.component';
import { SettingsComponent } from './settings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SettingsRoutingModule
  ],
  declarations: [
    SettingsIntegrationsComponent,
    SettingsIntegrationDialogComponent,
    SettingsIntegrationItemComponent,
    SettingsIntegrationDetailsComponent,
    SettingsComponent
  ],
  providers: [IntegrationService]
})
export class SettingsModule { }
