import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutVersionComponent } from './about-version/about-version.component';
import { AboutService } from './shared/about.service';

@NgModule({
  imports: [
    CommonModule,
    AboutRoutingModule
  ],
  declarations: [
    AboutVersionComponent
  ],
  providers: [
    AboutService
  ]
})
export class AboutModule { }
