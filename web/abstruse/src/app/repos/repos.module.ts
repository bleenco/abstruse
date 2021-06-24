import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared';
import { BuildsCommonModule } from '../builds/common/builds-common.module';
import { ReposRoutingModule } from './repos-routing.module';
import { ReposComponent } from './repos/repos.component';
import { RepoItemComponent } from './repo-item/repo-item.component';
import { RepoComponent } from './repo/repo.component';
import { SettingsComponent } from './settings/settings.component';
import { BuildsComponent } from './builds/builds.component';
import { BranchesComponent } from './branches/branches.component';
import { PullRequestsComponent } from './pull-requests/pull-requests.component';
import { SettingsEnvsComponent } from './settings-envs/settings-envs.component';
import { SettingsEnvModalComponent } from './settings-env-modal/settings-env-modal.component';
import { SettingsMountComponent } from './settings-mount/settings-mount.component';
import { SettingsMountModalComponent } from './settings-mount-modal/settings-mount-modal.component';

@NgModule({
  declarations: [
    ReposComponent,
    RepoItemComponent,
    RepoComponent,
    SettingsComponent,
    BuildsComponent,
    BranchesComponent,
    PullRequestsComponent,
    SettingsEnvsComponent,
    SettingsEnvModalComponent,
    SettingsMountComponent,
    SettingsMountModalComponent
  ],
  imports: [CommonModule, ReposRoutingModule, SharedModule, BuildsCommonModule]
})
export class ReposModule {}
