import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildsRoutingModule } from './builds-routing.module';
import { BuildsComponent } from './builds/builds.component';
import { SharedModule } from '../shared';
import { BuildListItemComponent } from './build-list-item/build-list-item.component';

@NgModule({
  declarations: [BuildsComponent, BuildListItemComponent],
  imports: [CommonModule, BuildsRoutingModule, SharedModule]
})
export class BuildsModule {}
