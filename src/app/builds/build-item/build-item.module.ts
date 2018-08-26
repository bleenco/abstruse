import { NgModule } from '@angular/core';
import { BuildItemComponent } from './build-item.component';
import { SharedModule } from '../../shared/modules/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule,
    SharedModule.forRoot()
  ],
  declarations: [BuildItemComponent],
  exports: [BuildItemComponent]
})
export class BuildItemModule { }
