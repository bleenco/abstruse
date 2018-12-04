import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgDatepickerModule } from 'ng2-datepicker';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { AuthGuardService } from '../providers/auth-guard.service';
import { StatusService } from '../providers/status.service';
import { TimeService } from '../providers/time.service';
import { TokenInterceptorProvider } from '../interceptors/token.interceptor';

import { LoaderComponent } from '../../core/loader/loader.component';
import { SelectboxComponent } from '../widgets/selectbox/selectbox.component';
import { AvatarPickerComponent } from '../widgets/avatar-picker/avatar-picker.component';
import { TerminalComponent } from '../widgets/terminal/terminal.component';
import { EditorComponent } from '../widgets/editor/editor.component';
import { ConfirmDialogComponent } from '../widgets/confirm-dialog/confirm-dialog.component';
import { ToggleComponent } from '../widgets/toggle/toggle.component';
import { ProgressBarComponent } from '../widgets/progress-bar/progress-bar.component';

import { StopPropagationDirective } from '../directives/stop-propagation.directive';
import { TooltipDirective } from '../directives/tooltip.directive';
import { EqualValidatorDirective } from '../validators/equal-password.directive';

import { ToTimePipe } from '../pipes/to-time.pipe';
import { HumanizeBytesPipe } from '../pipes/humanize-bytes.pipe';
import { PlaceholderComponent } from '../widgets/placeholder/placeholder.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgDatepickerModule,
    AngularSvgIconModule
  ],
  declarations: [
    LoaderComponent,
    SelectboxComponent,
    AvatarPickerComponent,
    TerminalComponent,
    EditorComponent,
    ConfirmDialogComponent,
    EqualValidatorDirective,
    ToTimePipe,
    HumanizeBytesPipe,
    StopPropagationDirective,
    ToggleComponent,
    ProgressBarComponent,
    PlaceholderComponent,
    TooltipDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    NgDatepickerModule,
    AngularSvgIconModule,
    LoaderComponent,
    SelectboxComponent,
    AvatarPickerComponent,
    TerminalComponent,
    EditorComponent,
    ConfirmDialogComponent,
    EqualValidatorDirective,
    ToTimePipe,
    HumanizeBytesPipe,
    StopPropagationDirective,
    ToggleComponent,
    ProgressBarComponent,
    PlaceholderComponent,
    TooltipDirective
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        TokenInterceptorProvider,
        AuthGuardService,
        StatusService,
        TimeService
      ]
    };
  }
}
