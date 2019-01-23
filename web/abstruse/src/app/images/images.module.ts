import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImagesRoutingModule } from './images-routing.module';
import { SharedModule } from '../shared/modules/shared.module';
import { ImagesListComponent } from './images-list/images-list.component';

@NgModule({
  declarations: [ImagesListComponent],
  imports: [
    CommonModule,
    ImagesRoutingModule,
    SharedModule.forRoot()
  ]
})
export class ImagesModule { }
