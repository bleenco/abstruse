import { Attribute, Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[validateEqual][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualValidator), multi: true }
  ]
})
export class EqualValidator implements Validator {
  constructor(@Attribute('validateEqual') public validateEqual: string) {}

  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    let e = c.root.get(this.validateEqual);

    if (e && v !== e.value) {
      return { validateEqual: false };
    }

    return null;
  }
}
