import { Component, OnInit, Input, ElementRef, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-avatar-picker',
  templateUrl: './avatar-picker.component.html',
  styleUrls: ['./avatar-picker.component.sass'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AvatarPickerComponent), multi: true }
  ]
})
export class AvatarPickerComponent implements ControlValueAccessor, OnInit {
  @Input() values: string[] = Array.apply(null, { length: 30 }).map(Number.call, Number).map((i: number) => {
    return `/assets/images/avatars/predefined/avatar_${i + 1}.svg`;
  });

  innerValue: string;
  isOpened: boolean;

  constructor(private elementRef: ElementRef) { }

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  get value(): string {
    return this.innerValue;
  }

  set value(val: string) {
    this.innerValue = val;
    if (!this.values) {
      throw Error('no values initialized');
    }

    const index = this.values.findIndex(v => v === val);
    if (index === -1) {
      throw Error('value does not exists');
    }

    this.onChangeCallback(this.innerValue);
  }

  ngOnInit() {
    this.isOpened = false;

    if (this.values && this.values.length) {
      this.value = this.values[0];
    }
  }

  selectAvatar(index: number): void {
    this.value = this.values[index];
    this.close();
  }

  toggle(): void {
    this.isOpened = !this.isOpened;
  }

  close(): void {
    this.isOpened = false;
  }

  writeValue(val: string) {
    if (!val) {
      return;
    }
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
