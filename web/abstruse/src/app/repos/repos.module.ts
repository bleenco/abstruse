import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReposRoutingModule } from './repos-routing.module';
import { ReposComponent } from './repos/repos.component';
import { SharedModule } from '../shared';
import { RepoItemComponent } from './repo-item/repo-item.component';
import { RepoComponent } from './repo/repo.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [ReposComponent, RepoItemComponent, RepoComponent, SettingsComponent],
  imports: [CommonModule, ReposRoutingModule, SharedModule]
})
export class ReposModule {}
