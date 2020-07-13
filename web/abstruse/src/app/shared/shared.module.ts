import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxUploaderModule } from 'ngx-uploader';
import { CookieService } from 'ngx-cookie-service';

import { SocketService } from './providers/socket.service';
import { ModalModule } from './components/modal/modal.module';
import { TimeService } from './providers/time.service';
import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';
import { SelectboxComponent } from './widgets/selectbox/selectbox.component';
import { TooltipDirective } from './directives/tooltip.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { ProgressWizardComponent } from './components/progress-wizard/progress-wizard.component';
import { AvatarPickerComponent } from './widgets/avatar-picker/avatar-picker.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, ModalModule, NgxUploaderModule],
  declarations: [
    CheckboxComponent,
    ProgressBarComponent,
    SelectboxComponent,
    TooltipDirective,
    LoaderComponent,
    ProgressWizardComponent,
    AvatarPickerComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxUploaderModule,
    CheckboxComponent,
    ProgressBarComponent,
    SelectboxComponent,
    TooltipDirective,
    LoaderComponent,
    ProgressWizardComponent,
    AvatarPickerComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [TimeService, CookieService, SocketService]
    };
  }
}
