import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SettingsUserComponent } from './settings-user/settings-user.component';

@NgModule({
  imports: [CommonModule, SettingsRoutingModule, SharedModule.forRoot()],
  declarations: [SettingsUserComponent]
})
export class SettingsModule {}
