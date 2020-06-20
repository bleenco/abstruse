import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesRoutingModule } from './images-routing.module';
import { ImagesListComponent } from './images-list/images-list.component';

@NgModule({
  declarations: [ImagesListComponent],
  imports: [CommonModule, ImagesRoutingModule]
})
export class ImagesModule {}
