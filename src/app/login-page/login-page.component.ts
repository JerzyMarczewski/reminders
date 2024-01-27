import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  constructor(private authService: AuthService) {}

  handleLogIn() {
    this.authService.signInUser('jerzy.marczewski2@gmail.com', '123123');
  }
}
