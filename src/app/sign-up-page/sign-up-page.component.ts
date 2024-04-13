import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { confirmPasswordValidator } from '../validators';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.scss',
})
export class SignUpPageComponent {
  signUpFormGroup!: FormGroup;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.signUpFormGroup = new FormGroup({
      username: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25),
        Validators.pattern('[a-zA-Z0-9]*'),
      ]),
      email: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/),
      ]),
      confirmPassword: new FormControl<string>('', [
        Validators.required,
        confirmPasswordValidator('password'),
      ]),
    });

    this.signUpFormGroup.get('password')?.valueChanges.subscribe(() => {
      this.signUpFormGroup.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  onSubmit() {
    const username = this.signUpFormGroup.controls?.['username'].value;
    const email = this.signUpFormGroup.controls?.['email'].value;
    const password = this.signUpFormGroup.controls?.['password'].value;

    if (this.signUpFormGroup.valid && username && email && password) {
      this.authService.signUpUser(username, email, password);
    }
  }
}
