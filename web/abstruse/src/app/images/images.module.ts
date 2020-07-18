import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesRoutingModule } from './images-routing.module';
import { ImagesComponent } from './images/images.component';
import { SharedModule } from '../shared';
import { ImageListItemComponent } from './image-list-item/image-list-item.component';
import { ImageModalComponent } from './image-modal/image-modal.component';

@NgModule({
  imports: [CommonModule, ImagesRoutingModule, SharedModule],
  declarations: [ImagesComponent, ImageListItemComponent, ImageModalComponent],
  entryComponents: [ImageModalComponent]
})
export class ImagesModule {}
