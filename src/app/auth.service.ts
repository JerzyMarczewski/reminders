import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  private authErrorSubject = new BehaviorSubject<string | null>(null);
  authError$ = this.authErrorSubject.asObservable();

  constructor(private auth: Auth, private snackBar: MatSnackBar) {
    this.user$ = user(auth);
  }

  createUser(username: string, email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return updateProfile(user, { displayName: username });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  }

  signInUser(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // ! DELETE LATER
        console.log('User logged in');
      })
      .catch((error) => this.displayError(error));
  }

  signOutUser() {
    this.auth
      .signOut()
      .then(() => {
        console.log('User logged out successfully');
      })
      .catch((error) => {
        console.error('Error while logging out:', error);
      });
  }

  private displayError(error: any) {
    let errorMessage = 'An error occurred during authentication.';

    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password.';
    }

    this.authErrorSubject.next(errorMessage);
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
