import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';

const routes: Routes = [
  {
    path: 'setup',
    pathMatch: 'full',
    component: SetupComponent,
    children: [{ path: '', component: UserComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule {}
