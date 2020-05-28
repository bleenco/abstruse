import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';
import { TokenInterceptorProvider } from './interceptors/token.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { AuthGuardService } from './providers/auth-guard.service';
import { StatusService } from './providers/status.service';
import { TimeService } from './providers/time.service';
import { HttpClientModule } from '@angular/common/http';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';
import { ModalModule } from './components/modal/modal.module';
import { ResizeService } from './providers/resize.service';
import { LineChartModule } from './charts/line-chart/line-chart.module';
import { PieChartModule } from './charts/pie-chart/pie-chart.module';
import { RealtimeChartModule } from './charts/realtime-chart/realtime-chart.module';
import { SelectboxComponent } from './widgets/selectbox/selectbox.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ModalModule,
    LineChartModule,
    PieChartModule,
    RealtimeChartModule,
  ],
  declarations: [
    ProgressBarComponent,
    SelectboxComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ProgressBarComponent,
    ModalModule,
    LineChartModule,
    PieChartModule,
    RealtimeChartModule,
    SelectboxComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        TokenInterceptorProvider,
        HttpErrorInterceptor,
        AuthGuardService,
        StatusService,
        TimeService,
        CookieService,
        ResizeService
      ]
    };
  }
}
