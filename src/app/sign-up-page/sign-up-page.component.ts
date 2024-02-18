import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.scss',
})
export class SignUpPageComponent {
  signUpFormGroup!: FormGroup;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.signUpFormGroup = new FormGroup(
      {
        username: new FormControl<string>('', [Validators.required]),
        email: new FormControl<string>('', [
          Validators.required,
          Validators.email,
        ]),
        password: new FormControl<string>('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl<string>('', [
          Validators.required,
          Validators.minLength(6),
        ]),
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    return password &&
      confirmPassword &&
      password.value === confirmPassword.value
      ? null
      : { passwordsNotMatch: true };
  };

  onSubmit() {
    const username = this.signUpFormGroup.controls?.['username'].value;
    const email = this.signUpFormGroup.controls?.['email'].value;
    const password = this.signUpFormGroup.controls?.['password'].value;

    if (this.signUpFormGroup.valid && username && email && password) {
      this.authService.createUser(username, email, password);
    }
  }
}
