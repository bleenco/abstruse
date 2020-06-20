import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { throwIfAlreadyLoaded } from './shared/shared-functions';

import { HeaderComponent } from './header/header.component';
import { HeaderDropdownComponent } from './header-dropdown/header-dropdown.component';

import { SocketService } from '../shared/providers/socket.service';
import { DataService } from '../shared/providers/data.service';
import { AuthService } from '../shared/providers/auth.service';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule],
  declarations: [HeaderComponent, HeaderDropdownComponent],
  exports: [HeaderComponent, HeaderDropdownComponent],
  providers: [SocketService, DataService, AuthService]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
