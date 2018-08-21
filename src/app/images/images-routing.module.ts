import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ImagesComponent } from './images.component';
import { ImagesListComponent } from './images-list/images-list.component';

const imagesRoutes: Routes = [
  {
    path: '',
    component: ImagesComponent,
    children: [
      { path: '', component: ImagesListComponent }
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
