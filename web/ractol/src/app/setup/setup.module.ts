import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupDoneGuardService } from './shared/setup-done-guard.service';
import { SetupRoutingModule } from './setup-routing.module';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';
import { SharedModule } from '../shared';
import { DatabaseComponent } from './database/database.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  imports: [CommonModule, SetupRoutingModule, SharedModule],
  declarations: [UserComponent, SetupComponent, DatabaseComponent, HeaderComponent],
  providers: [SetupDoneGuardService]
})
export class SetupModule {}
