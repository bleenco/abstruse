import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkersComponent } from './workers.component';
import { WorkersListComponent } from './workers-list/workers-list.component';

const routes: Routes = [
  {
    path: '',
    component: WorkersComponent,
    children: [{ path: '', component: WorkersListComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkersRoutingModule {}
