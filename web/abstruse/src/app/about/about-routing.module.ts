import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutVersionComponent } from './about-version/about-version.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: AboutVersionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutRoutingModule { }
