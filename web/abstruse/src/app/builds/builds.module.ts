import { NgModule } from '@angular/core';

import { BuildsRoutingModule } from './builds-routing.module';
import { SharedModule } from '../shared/modules/shared.module';

import { BuildsComponent } from './builds.component';
import { BuildsLatestComponent } from './builds-latest/builds-latest.component';

@NgModule({
  imports: [
    BuildsRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    BuildsComponent,
    BuildsLatestComponent
  ],
  providers: []
})
export class BuildsModule { }
