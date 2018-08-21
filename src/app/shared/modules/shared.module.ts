import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthGuardService } from '../providers/auth-guard.service';
import { StatusService } from '../providers/status.service';
import { AuthService } from '../providers/auth.service';
import { SocketService } from '../providers/socket.service';
import { DataService } from '../providers/data.service';
import { TimeService } from '../providers/time.service';
import { TokenInterceptorProvider } from '../interceptors/token.interceptor';

import { LoaderComponent } from '../../core/loader/loader.component';
import { SelectboxComponent } from '../widgets/selectbox/selectbox.component';
import { AvatarPickerComponent } from '../widgets/avatar-picker/avatar-picker.component';
import { TerminalComponent } from '../widgets/terminal/terminal.component';

import { StopPropagationDirective } from '../directives/stop-propagation.directive';
import { EqualValidatorDirective } from '../validators/equal-password.directive';

import { ToTimePipe } from '../pipes/to-time.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    LoaderComponent,
    SelectboxComponent,
    AvatarPickerComponent,
    TerminalComponent,
    EqualValidatorDirective,
    ToTimePipe,
    StopPropagationDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    LoaderComponent,
    SelectboxComponent,
    AvatarPickerComponent,
    TerminalComponent,
    EqualValidatorDirective,
    ToTimePipe,
    StopPropagationDirective
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
        AuthService,
        SocketService,
        DataService,
        TimeService
      ]
    };
  }
}
