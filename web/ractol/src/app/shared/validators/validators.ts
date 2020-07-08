import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import parseDuration from 'parse-duration';

export function durationValidator(compare: AbstractControl): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cmpdur = parseDuration(compare.value) as number;
    const dur = parseDuration(control.value) as number;
    return cmpdur < dur ? null : { duration: true };
  };
}
