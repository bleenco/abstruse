import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupRoutingModule } from './setup-routing.module';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';

@NgModule({
  imports: [CommonModule, SetupRoutingModule],
  declarations: [UserComponent, SetupComponent]
})
export class SetupModule {}
