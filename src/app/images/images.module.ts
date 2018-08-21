import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/modules/shared.module';

import { ImagesRoutingModule } from './images-routing.module';
import { ImagesComponent } from './images.component';
import { ImagesListComponent } from './images-list/images-list.component';

@NgModule({
  imports: [
    ImagesRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    ImagesComponent,
    ImagesListComponent
  ],
  providers: []
})
export class ImagesModule { }
