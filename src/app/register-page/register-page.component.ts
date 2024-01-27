import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  constructor(private authService: AuthService) {}

  handleRegister() {
    this.authService.createUser('jerzy.marczewski2@gmail.com', '123123');
  }
}
