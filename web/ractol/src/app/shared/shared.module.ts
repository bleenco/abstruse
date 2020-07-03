import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { TokenInterceptorProvider } from './interceptors/token.interceptor';

import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';
import { SelectboxComponent } from './widgets/selectbox/selectbox.component';

import { TooltipDirective } from './directives/tooltip.directive';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule],
  declarations: [CheckboxComponent, ProgressBarComponent, SelectboxComponent, TooltipDirective, LoaderComponent],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    CheckboxComponent,
    ProgressBarComponent,
    SelectboxComponent,
    TooltipDirective,
    LoaderComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [TokenInterceptorProvider]
    };
  }
}
