import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupDoneGuardService } from './shared/setup-done-guard.service';
import { SetupRoutingModule } from './setup-routing.module';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';
import { SharedModule } from '../shared';
import { DatabaseComponent } from './database/database.component';
import { HeaderComponent } from './header/header.component';
import { ControlsComponent } from './controls/controls.component';
import { SecurityComponent } from './security/security.component';
import { EtcdComponent } from './etcd/etcd.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, SetupRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [
    UserComponent,
    SetupComponent,
    DatabaseComponent,
    HeaderComponent,
    ControlsComponent,
    SecurityComponent,
    EtcdComponent
  ],
  providers: [SetupDoneGuardService]
})
export class SetupModule {}
