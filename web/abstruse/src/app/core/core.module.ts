import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { throwIfAlreadyLoaded } from './shared/shared-functions';

import { HeaderComponent } from './header/header.component';
import { HeaderDropdownComponent } from './header-dropdown/header-dropdown.component';
import { SettingsComponent } from './settings/settings/settings.component';

import { SharedModule } from '../shared/shared.module';
import { SocketService } from '../shared/providers/socket.service';
import { DataService } from '../shared/providers/data.service';
import { AuthService } from '../shared/providers/auth.service';
import { SettingsService } from '../shared/providers/settings.service';
import { SettingsUserComponent } from './settings/settings-user/settings-user.component';
import { SettingsAppearanceComponent } from './settings/settings-appearance/settings-appearance.component';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  declarations: [
    HeaderComponent,
    HeaderDropdownComponent,
    SettingsComponent,
    SettingsUserComponent,
    SettingsAppearanceComponent
  ],
  exports: [HeaderComponent, HeaderDropdownComponent, SettingsComponent, SettingsUserComponent],
  providers: [SocketService, DataService, AuthService, SettingsService]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
