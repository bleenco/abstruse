import { Component } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.sass'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: ToggleComponent, multi: true }
  ]
})
export class ToggleComponent implements ControlValueAccessor {
  isEnabled: boolean;

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  get value(): boolean {
    return this.isEnabled;
  }

  set value(val: boolean) {
    this.isEnabled = val;
    this.onChangeCallback(this.isEnabled);
  }

  toggle(): void {
    const curr = this.value;
    this.value = !curr;
  }

  writeValue(val: boolean) {
    this.isEnabled = val;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
