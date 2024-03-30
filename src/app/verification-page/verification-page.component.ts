import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { SnackbarService } from '../snackbar.service';

@Component({
  selector: 'app-verification-page',
  templateUrl: './verification-page.component.html',
  styleUrl: './verification-page.component.scss',
})
export class VerificationPageComponent {
  constructor(
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  resendVerificationEmail() {
    this.authService.sendVerificationEmail().then(() => {
      this.snackbarService.showMessage('Verification email sent.');
    });
  }

  confirmVerification() {
    this.authService.isUserVerified().then((emailIsConfirmed: boolean) => {
      if (!emailIsConfirmed)
        this.snackbarService.showMessage(
          'Email Confirmation Failed. Please check the link in your email and try again.'
        );
    });
  }
}
