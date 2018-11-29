import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[appValidateEqual][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => EqualValidatorDirective), multi: true }
  ]
})
export class EqualValidatorDirective implements Validator {
  constructor(@Attribute('appValidateEqual') public appValidateEqual: string) {}

  validate(c: AbstractControl): { [key: string]: any } {
    const v = c.value;
    const e = c.root.get(this.appValidateEqual);

    if (e && v !== e.value) {
      return { appValidateEqual: false };
    }

    return null;
  }
}
