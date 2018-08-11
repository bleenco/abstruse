import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildsRoutingModule } from './builds-routing.module';
import { SharedModule } from '../shared/modules/shared.module';

import { BuildsComponent } from './builds.component';
import { BuildsLatestComponent } from './builds-latest/builds-latest.component';

@NgModule({
  imports: [
    CommonModule,
    BuildsRoutingModule,
    SharedModule
  ],
  declarations: [
    BuildsComponent,
    BuildsLatestComponent
  ],
  providers: []
})
export class BuildsModule { }
