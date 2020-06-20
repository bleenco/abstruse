import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';
import { TokenInterceptorProvider } from './interceptors/token.interceptor';
import { HttpErrorInterceptorProvider } from './interceptors/http-error.interceptor';
import { AuthGuardService } from './providers/auth-guard.service';
import { StatusService } from './providers/status.service';
import { TimeService } from './providers/time.service';
import { HttpClientModule } from '@angular/common/http';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';
import { ModalModule } from './components/modal/modal.module';
import { ResizeService } from './providers/resize.service';
import { SelectboxComponent } from './widgets/selectbox/selectbox.component';
import { SpinnerComponent } from './widgets/spinner/spinner.component';
import { TerminalComponent } from './widgets/terminal/terminal.component';
import { StopPropagationDirective } from './directives/stop-propagation.directive';
import { ToggleComponent } from './widgets/toggle/toggle.component';
import { RadioTabsComponent } from './widgets/radio-tabs/radio-tabs.component';
import { CheckboxComponent } from './widgets/checkbox/checkbox.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ModalModule
  ],
  declarations: [
    ProgressBarComponent,
    SelectboxComponent,
    SpinnerComponent,
    TerminalComponent,
    StopPropagationDirective,
    ToggleComponent,
    RadioTabsComponent,
    CheckboxComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ProgressBarComponent,
    ModalModule,
    SelectboxComponent,
    SpinnerComponent,
    TerminalComponent,
    StopPropagationDirective,
    ToggleComponent,
    RadioTabsComponent,
    CheckboxComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        TokenInterceptorProvider,
        HttpErrorInterceptorProvider,
        AuthGuardService,
        StatusService,
        TimeService,
        CookieService,
        ResizeService
      ]
    };
  }
}
