import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/modules/shared.module';

import { RepositoriesService } from './shared/repositories.service';
import { BuildService } from '../builds/shared/build.service';

import { RepositoriesRoutingModule } from './repositories-routing.module';
import { RepositoriesComponent } from './repositories.component';
import { RepositoriesListComponent } from './repositories-list/repositories-list.component';
import { RepositoriesRepoItemComponent } from './repositories-repo-item/repositories-repo-item.component';
import { RepositoriesRepoDetailsComponent } from './repositories-repo-details/repositories-repo-details.component';
import { BuildItemModule } from '../builds/build-item/build-item.module';

@NgModule({
  imports: [
    RepositoriesRoutingModule,
    SharedModule.forRoot(),
    BuildItemModule
  ],
  declarations: [
    RepositoriesComponent,
    RepositoriesListComponent,
    RepositoriesRepoItemComponent,
    RepositoriesRepoDetailsComponent
  ],
  providers: [RepositoriesService, BuildService]
})
export class RepositoriesModule { }
