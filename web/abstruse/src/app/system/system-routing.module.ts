import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VersionComponent } from './version/version.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'version' },
  { path: 'version', component: VersionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule {}
