import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImagesListComponent } from './images-list/images-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ImagesListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImagesRoutingModule { }
