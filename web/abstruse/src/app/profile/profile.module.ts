import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SecurityComponent } from './security/security.component';
import { SettingsComponent } from './settings/settings.component';
import { SessionsComponent } from './sessions/sessions.component';
import { SessionListItemComponent } from './session-list-item/session-list-item.component';

@NgModule({
  declarations: [ProfileComponent, SecurityComponent, SettingsComponent, SessionsComponent, SessionListItemComponent],
  imports: [CommonModule, ProfileRoutingModule, SharedModule]
})
export class ProfileModule {}
