import { Component, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { hexToRGB } from 'src/app/core/shared/shared-functions';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.sass'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: ColorPickerComponent, multi: true }
  ]
})
export class ColorPickerComponent implements OnInit, ControlValueAccessor {
  color: string;
  colors: string[] = [];

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  get value(): string {
    return this.color;
  }

  set value(color: string) {
    this.color = color;
    this.onChangeCallback(this.color);
  }

  ngOnInit() {
    const initialColors = [
      '#1665D8',
      '#34AA44',
      '#6758F3',
      '#E6492D',
      '#F6AB2F',
      '#FACF55'
    ];

    this.colors = initialColors.reduce((acc, curr) => {
      return acc.concat(...[hexToRGB(curr, 1), hexToRGB(curr, .75), hexToRGB(curr, .50), hexToRGB(curr, .25)]);
    }, []);

    this.value = this.colors[0];
  }

  pick(color: string): void {
    this.color = color;
  }

  writeValue(color: string) {
    this.color = color;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
