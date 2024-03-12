import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

export function confirmPasswordValidator(controlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) {
      return null;
    }

    const passwordControl = formGroup.get(controlName);
    if (!passwordControl) {
      return null;
    }

    const passwordsMatch = control.value === passwordControl.value;
    return passwordsMatch ? null : { passwordsNotMatch: true };
  };
}
