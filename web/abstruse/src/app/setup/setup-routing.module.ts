import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
import { SetupComponent } from './setup.component';
import { SetupDoneGuardService } from './shared/setup-done-guard.service';
import { DatabaseComponent } from './database/database.component';
import { SecurityComponent } from './security/security.component';
import { EtcdComponent } from './etcd/etcd.component';

const routes: Routes = [
  {
    path: 'setup',
    component: SetupComponent,
    canActivate: [SetupDoneGuardService],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'security' },
      { path: 'security', component: SecurityComponent },
      { path: 'database', component: DatabaseComponent },
      { path: 'user', component: UserComponent },
      { path: 'etcd', component: EtcdComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule {}
