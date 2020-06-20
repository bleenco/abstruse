import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.sass'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CheckboxComponent, multi: true }],
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';

  isEnabled: boolean;
  id = Math.random().toString(36).substr(2, 5);

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  get value(): boolean {
    return this.isEnabled;
  }

  set value(val: boolean) {
    this.isEnabled = val;
    this.onChangeCallback(this.isEnabled);
    this.onTouchedCallback();
  }

  toggle(): void {
    this.value = !this.value;
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
