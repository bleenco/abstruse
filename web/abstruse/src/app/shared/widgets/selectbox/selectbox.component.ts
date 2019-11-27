import { Component, OnInit, Input, ElementRef, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-selectbox',
  templateUrl: './selectbox.component.html',
  styleUrls: ['./selectbox.component.sass'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectboxComponent), multi: true }
  ]
})
export class SelectboxComponent implements ControlValueAccessor, OnInit {
  @Input() values: { value: any,  placeholder: string }[];
  @Input() customIcon: string;

  innerValue: number | string | boolean;
  placeholder: string;
  isOpened: boolean;

  constructor(private elementRef: ElementRef) { }

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  get value(): number | string | boolean {
    return this.innerValue;
  }

  set value(val: number | string | boolean) {
    if (!this.values) {
      throw Error('no values initialized');
    }

    const index = this.values.findIndex(v => v.value === val);
    if (index === -1) {
      return;
    }

    this.innerValue = val;
    this.placeholder = this.values[index].placeholder;
    this.onChangeCallback(this.innerValue);
  }

  ngOnInit() {
    this.isOpened = false;
  }

  toggle(): void {
    this.isOpened = !this.isOpened;
  }

  close(): void {
    this.isOpened = false;
  }

  writeValue(val: number | string | boolean) {
    if (!val && typeof val !== 'boolean') {
      return;
    }

    const index = this.values.findIndex(v => v.value === val);
    if (index === -1) {
      return;
    }

    this.placeholder = this.values[index].placeholder;
    this.innerValue = val;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  @HostListener('document:click', ['$event']) onBlur(e: MouseEvent) {
    if (!this.isOpened) {
      return;
    }

    const input = this.elementRef.nativeElement.querySelector('.selectbox-value');

    if (input == null) {
      return;
    }

    if (e.target === input || input.contains(<any>e.target)) {
      return;
    }

    const container = this.elementRef.nativeElement.querySelector('.selectbox-container');
    if (container && container !== e.target && !container.contains(<any>e.target)) {
      this.close();
    }
  }
}
