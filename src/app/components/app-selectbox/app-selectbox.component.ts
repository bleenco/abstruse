import { Component, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-selectbox',
  templateUrl: 'app-selectbox.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: AppSelectboxComponent, multi: true }
  ]
})
export class AppSelectboxComponent implements OnChanges {
  @Input() data: { key: string, value: string }[];

  index: number;
  opened: boolean;
  tmp: string;

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  get value(): string {
    return this.data[this.index].key;
  }

  set value(val: string) {
    if (!val) {
      return;
    }

    this.index = this.data.findIndex(d => d.key === val);
    this.onChangeCallback(this.data[this.index].key);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.data && this.data.length) {
      this.index = this.data.findIndex(d => d.key === this.tmp);
      if (this.data[this.index]) {
        this.value = this.data[this.index].key;
      }
    }
  }

  writeValue(val: string) {
    if (val === null) {
      return;
    }

    this.tmp = val;
    this.index = this.data.findIndex(d => d.key === val);
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
