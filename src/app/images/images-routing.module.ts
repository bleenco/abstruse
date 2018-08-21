import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ImagesComponent } from './images.component';

const imagesRoutes: Routes = [
  {
    path: '',
    component: ImagesComponent,
    children: [
      // { path: '', component: BuildsLatestComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(imagesRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ImagesRoutingModule { }
