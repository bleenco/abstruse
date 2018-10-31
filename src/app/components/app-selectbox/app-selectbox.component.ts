import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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

  private onChangeCallback: (_: any) => void = () => { };

  get value(): string {
    return this.data[this.index].key;
  }

  set value(val: string) {
    let ind = this.data.findIndex(d => d.key === val);
    if (ind !== -1) {
      this.index = ind;
      this.onChangeCallback(this.data[this.index].key);
    }
  }

  ngOnChanges(_changes: SimpleChanges) {
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

  registerOnTouched() { }

}
