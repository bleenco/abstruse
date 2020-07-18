import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesRoutingModule } from './images-routing.module';
import { ImagesComponent } from './images/images.component';
import { SharedModule } from '../shared';
import { ImageListItemComponent } from './image-list-item/image-list-item.component';

@NgModule({
  declarations: [ImagesComponent, ImageListItemComponent],
  imports: [CommonModule, ImagesRoutingModule, SharedModule]
})
export class ImagesModule {}
