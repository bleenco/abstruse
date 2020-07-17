import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared';
import { SystemRoutingModule } from './system-routing.module';
import { VersionComponent } from './version/version.component';

@NgModule({
  imports: [CommonModule, SystemRoutingModule, SharedModule],
  declarations: [VersionComponent]
})
export class SystemModule {}
