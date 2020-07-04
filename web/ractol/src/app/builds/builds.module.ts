import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildsRoutingModule } from './builds-routing.module';
import { BuildsComponent } from './builds/builds.component';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [BuildsComponent],
  imports: [CommonModule, BuildsRoutingModule, SharedModule]
})
export class BuildsModule {}
