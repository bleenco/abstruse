import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';
import { SetupDoneGuardService } from './shared/setup-done-guard.service';
import { DatabaseComponent } from './database/database.component';

const routes: Routes = [
  {
    path: 'setup',
    component: SetupComponent,
    canActivate: [SetupDoneGuardService],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'database' },
      { path: 'database', component: DatabaseComponent },
      { path: 'user', component: UserComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule {}
