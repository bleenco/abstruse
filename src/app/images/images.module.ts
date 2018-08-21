import { NgModule } from '@angular/core';

import { ImagesRoutingModule } from './images-routing.module';
import { ImagesComponent } from './images.component';

@NgModule({
  imports: [
    ImagesRoutingModule,
  ],
  declarations: [
    ImagesComponent
  ],
  providers: []
})
export class ImagesModule { }
