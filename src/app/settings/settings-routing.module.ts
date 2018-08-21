import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SettingsComponent } from './settings.component';

const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      // { path: '', component: BuildsLatestComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(settingsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SettingsRoutingModule { }
