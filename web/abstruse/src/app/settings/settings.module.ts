import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsPersonalComponent } from './settings-personal/settings-personal.component';
import { SettingsIntegrationDialogComponent } from './settings-integration-dialog/settings-integration-dialog.component';
import { FormsModule } from '@angular/forms';
import { IntegrationService } from './shared/integration.service';
import { SettingsIntegrationItemComponent } from './settings-integration-item/settings-integration-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SettingsRoutingModule
  ],
  declarations: [
    SettingsPersonalComponent,
    SettingsIntegrationDialogComponent,
    SettingsIntegrationItemComponent
  ],
  providers: [IntegrationService]
})
export class SettingsModule { }
