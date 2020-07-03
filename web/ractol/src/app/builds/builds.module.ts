import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildsRoutingModule } from './builds-routing.module';
import { BuildsComponent } from './builds/builds.component';

@NgModule({
  declarations: [BuildsComponent],
  imports: [CommonModule, BuildsRoutingModule]
})
export class BuildsModule {}
