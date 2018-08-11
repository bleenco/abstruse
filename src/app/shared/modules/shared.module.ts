import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthGuardService } from '../providers/auth-guard.service';
import { StatusService } from '../providers/status.service';
import { AuthService } from '../providers/auth.service';

import { LoaderComponent } from '../../core/loader/loader.component';
import { SelectboxComponent } from '../widgets/selectbox/selectbox.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    LoaderComponent,
    SelectboxComponent
  ],
  exports: [
    LoaderComponent,
    SelectboxComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        AuthGuardService,
        StatusService,
        AuthService
      ]
    };
  }
}
