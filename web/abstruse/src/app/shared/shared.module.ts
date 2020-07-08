import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';
import { SelectboxComponent } from './widgets/selectbox/selectbox.component';

import { TooltipDirective } from './directives/tooltip.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { ProgressWizardComponent } from './components/progress-wizard/progress-wizard.component';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule],
  declarations: [
    CheckboxComponent,
    ProgressBarComponent,
    SelectboxComponent,
    TooltipDirective,
    LoaderComponent,
    ProgressWizardComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    CheckboxComponent,
    ProgressBarComponent,
    SelectboxComponent,
    TooltipDirective,
    LoaderComponent,
    ProgressWizardComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
