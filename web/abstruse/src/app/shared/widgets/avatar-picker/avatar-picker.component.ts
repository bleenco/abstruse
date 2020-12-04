import { Component, OnInit, Input, ElementRef, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { randomInt } from '../../common/random-int';

@Component({
  selector: 'app-avatar-picker',
  templateUrl: './avatar-picker.component.html',
  styleUrls: ['./avatar-picker.component.sass'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AvatarPickerComponent), multi: true }]
})
export class AvatarPickerComponent implements ControlValueAccessor, OnInit {
  @Input() values: string[] = [...new Array(30)].map((_, i: number) => {
    return `/assets/images/avatars/avatar_${i + 1}.svg`;
  });

  innerValue!: string;
  isOpened!: boolean;

  constructor(private elementRef: ElementRef) {}

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (_: any) => void = () => {};

  get value(): string {
    return this.innerValue;
  }

  set value(val: string) {
    if (!this.values) {
      throw new Error('no values initialized');
    }

    this.innerValue = val;

    const index = this.values.findIndex(v => v === val);
    if (index === -1) {
      throw new Error('value does not exists');
    }

    this.onChangeCallback(this.innerValue);
  }

  ngOnInit(): void {
    this.isOpened = false;

    if (this.values && this.values.length) {
      this.value = this.values[randomInt(0, this.values.length - 1)];
    }
  }

  selectAvatar(index: number): void {
    this.value = this.values[index];
    this.close();
    this.onTouchedCallback();
  }

  toggle(): void {
    this.isOpened = !this.isOpened;
  }

  close(): void {
    this.isOpened = false;
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

  @HostListener('document:click', ['$event']) onBlur(e: MouseEvent): void {
    if (!this.isOpened) {
      return;
    }

    const input = this.elementRef.nativeElement.querySelector('.avatars-picker');
    if (!input || e.target === input || input.contains(e.target)) {
      return;
    }

    const container = this.elementRef.nativeElement.querySelector('.avatar-picker-container');
    if (container && container !== e.target && !container.contains(e.target)) {
      this.close();
    }
  }
}
