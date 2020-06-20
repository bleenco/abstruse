import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-radio-tabs',
  templateUrl: './radio-tabs.component.html',
  styleUrls: ['./radio-tabs.component.sass'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioTabsComponent), multi: true }]
})
export class RadioTabsComponent implements ControlValueAccessor, OnInit {
  @Input() values: { value: string | number | boolean; placeholder: string }[];

  innerValue: number | string | boolean;

  constructor() {}

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  get value(): number | string | boolean {
    return this.innerValue;
  }

  set value(val: number | string | boolean) {
    if (!this.values) {
      throw Error('no values initialized');
    }
    const selection = this.values.find(v => v.value === val);
    if (!selection) {
      return;
    }

    this.innerValue = selection.value;
    this.onChangeCallback(this.innerValue);
  }

  ngOnInit(): void {}

  writeValue(val: number | string | boolean) {
    if (!val) {
      return;
    }
    if (!this.values) {
      throw Error('no values initialized');
    }
    const selection = this.values.find(v => v.value === val);
    if (!selection) {
      return;
    }

    this.innerValue = selection.value;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
