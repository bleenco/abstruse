import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';
import { SetupDoneGuardService } from './shared/setup-done-guard.service';

const routes: Routes = [
  {
    path: 'setup',
    pathMatch: 'full',
    component: SetupComponent,
    canActivate: [SetupDoneGuardService],
    children: [{ path: '', component: UserComponent }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule {}
