import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { throwIfAlreadyLoaded } from './shared/shared-functions';

import { HeaderComponent } from './header/header.component';
import { HeaderDropdownComponent } from './header-dropdown/header-dropdown.component';
import { SettingsComponent } from './settings/settings/settings.component';

import { SocketService } from '../shared/providers/socket.service';
import { DataService } from '../shared/providers/data.service';
import { AuthService } from '../shared/providers/auth.service';
import { SettingsService } from '../shared/providers/settings.service';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule],
  declarations: [HeaderComponent, HeaderDropdownComponent, SettingsComponent],
  exports: [HeaderComponent, HeaderDropdownComponent, SettingsComponent],
  providers: [SocketService, DataService, AuthService, SettingsService]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
