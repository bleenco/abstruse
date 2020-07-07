import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupDoneGuardService } from './shared/setup-done-guard.service';
import { SetupRoutingModule } from './setup-routing.module';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';
import { SharedModule } from '../shared';

@NgModule({
  imports: [CommonModule, SetupRoutingModule, SharedModule],
  declarations: [UserComponent, SetupComponent],
  providers: [SetupDoneGuardService]
})
export class SetupModule {}
