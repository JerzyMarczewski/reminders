import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrl: './sign-in-page.component.scss',
})
export class SignInPageComponent {
  signInFormGroup!: FormGroup;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.signInFormGroup = new FormGroup({
      email: new FormControl<string>('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  get email() {
    return this.signInFormGroup.get('email');
  }

  get password() {
    return this.signInFormGroup.get('password');
  }

  onSubmit() {
    if (this.signInFormGroup.valid && this.signInFormGroup.valid)
      return this.authService.signInUser(
        this.signInFormGroup.value.email,
        this.signInFormGroup.value.password
      );
  }
}
