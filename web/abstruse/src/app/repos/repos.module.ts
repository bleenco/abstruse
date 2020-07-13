import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReposRoutingModule } from './repos-routing.module';
import { ReposComponent } from './repos/repos.component';
import { SharedModule } from '../shared';
import { RepoItemComponent } from './repo-item/repo-item.component';
import { RepoComponent } from './repo/repo.component';

@NgModule({
  declarations: [ReposComponent, RepoItemComponent, RepoComponent],
  imports: [CommonModule, ReposRoutingModule, SharedModule]
})
export class ReposModule {}
