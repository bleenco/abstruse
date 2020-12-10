import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { randomInt } from '../../common/random-int';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.sass'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerComponent), multi: true }]
})
export class ColorPickerComponent implements OnInit {
  @Input() colors: string[] = [
    '#cbd5e0',
    '#a0aec0',
    '#718096',
    '#e95949',
    '#e74c3c',
    '#e64533',
    '#f6ad55',
    '#ed8936',
    '#dd6b20',
    '#f6e05e',
    '#ecc94b',
    '#d69e2e',
    '#68d391',
    '#48bb78',
    '#38a169',
    '#4fd1c5',
    '#38b2ac',
    '#319795',
    '#63b3ed',
    '#4299e1',
    '#3182ce',
    '#7f9cf5',
    '#667eea',
    '#5a67d8',
    '#b794f4',
    '#9f7aea',
    '#805ad5',
    '#f687b3',
    '#ed64a6',
    '#d53f8c'
  ];

  innerValue!: string;

  constructor() {}

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  get value(): string {
    return this.innerValue;
  }

  set value(val: string) {
    this.innerValue = val;
    this.onChangeCallback(this.innerValue);
  }

  ngOnInit(): void {
    this.value = this.colors[randomInt(0, this.colors.length - 1)];
  }

  writeValue(val: string): void {
    if (!val) {
      return;
    }
    this.innerValue = val;
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }
}
