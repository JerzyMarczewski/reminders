import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  showMessage(message: string, action: string = 'Close') {
    this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  displayFirebaseError(
    error: FirebaseError,
    action: string = 'Close',
    message?: string
  ): void {
    if (message) {
      this.snackBar.open(message, action, {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    let errorMessage = 'A Firebase error occurred.';

    if (
      error.code === 'auth/invalid-email' ||
      error.code === 'auth/missing-password' ||
      error.code === 'auth/invalid-credential'
    )
      errorMessage = 'Invalid credentials';

    if (error.code === 'auth/email-already-in-use')
      errorMessage = 'Email already in use.';

    if (error.code === 'auth/too-many-requests')
      errorMessage = 'Too many firebase requests.';

    this.snackBar.open(errorMessage, action, {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
