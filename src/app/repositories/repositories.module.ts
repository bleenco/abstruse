import { NgModule } from '@angular/core';

import { RepositoriesRoutingModule } from './repositories-routing.module';
import { RepositoriesComponent } from './repositories.component';

@NgModule({
  imports: [
    RepositoriesRoutingModule,
  ],
  declarations: [
    RepositoriesComponent
  ],
  providers: []
})
export class RepositoriesModule { }
