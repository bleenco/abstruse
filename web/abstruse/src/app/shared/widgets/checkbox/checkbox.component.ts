import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.sass'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: CheckboxComponent, multi: true }]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label!: string;

  isEnabled!: boolean;
  id = Math.random().toString(36).substr(2, 5);

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  get value(): boolean {
    return this.isEnabled;
  }

  set value(val: boolean) {
    this.isEnabled = val;
    this.onChangeCallback(this.isEnabled);
  }

  onChanged(ev: Event): void {
    this.value = (ev && ev.target && (ev.target as HTMLInputElement).checked) as boolean;
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  writeValue(val: boolean): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }
}
