import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { BuildListItemComponent } from './build-list-item/build-list-item.component';
import { BuildsItemsComponent } from './builds-items/builds-items.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [BuildListItemComponent, BuildsItemsComponent],
  exports: [BuildListItemComponent, BuildsItemsComponent]
})
export class BuildsCommonModule {}
