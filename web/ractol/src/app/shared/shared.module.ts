import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule],
  declarations: [CheckboxComponent, ProgressBarComponent],
  exports: [CommonModule, FormsModule, HttpClientModule, CheckboxComponent, ProgressBarComponent]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
