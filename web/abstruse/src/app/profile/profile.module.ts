import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SecurityComponent } from './security/security.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [ProfileComponent, SecurityComponent, SettingsComponent],
  imports: [CommonModule, ProfileRoutingModule, SharedModule]
})
export class ProfileModule {}
