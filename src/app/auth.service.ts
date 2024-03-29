import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  private authErrorSubject = new BehaviorSubject<string | null>(null);
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(public auth: Auth, private snackBar: MatSnackBar) {
    this.user$ = user(auth);
    this.user$.subscribe(this.currentUser$);
  }

  signUpUser(username: string, email: string, password: string): void {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const defaultAvatarPath = 'avatars/0.png';

        return Promise.all([
          updateProfile(user, {
            displayName: username,
            photoURL: defaultAvatarPath,
          }),
          sendEmailVerification(user),
        ]);
      })
      .then(() => {
        // display that mail has been sent
        console.log('Verification email sent.');
      })
      .catch((error) => {
        console.error('Error signing up user:', error);
        console.log(error.code);
        this.displayError(error);
      });
  }

  isUserVerified(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const user = this.auth.currentUser;
      if (!user) {
        reject(new Error('User is not signed in.'));
        return;
      }

      user
        .reload()
        .then(() => {
          const reloadedUser = this.auth.currentUser;
          resolve(reloadedUser ? reloadedUser.emailVerified : false);
        })
        .catch((error) => {
          console.error('Error checking email verification status:', error);
          resolve(false);
        });
    });
  }

  sendVerificationEmail(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const user = this.auth.currentUser;
      if (!user) {
        reject(new Error('User is not signed in.'));
        return;
      }

      sendEmailVerification(user)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  signInUser(email: string, password: string): void {
    signInWithEmailAndPassword(this.auth, email, password).catch((error) =>
      this.displayError(error)
    );
  }

  signOutUser() {
    this.auth.signOut().catch((error) => {
      console.error('Error while logging out:', error);
    });
  }

  editProfile(username: string, avatarPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const user = this.auth.currentUser;
      if (!user) {
        reject(new Error('User is not signed in.'));
        return;
      }

      updateProfile(user, {
        displayName: username,
        photoURL: avatarPath,
      })
        .then(() => {
          const updatedUser: User = {
            ...user,
            displayName: username,
            photoURL: avatarPath,
          };

          this.currentUser$.next(updatedUser);
          resolve();
        })
        .catch((error) => {
          console.error('Error updating display name:', error);
          reject(error);
        });
    });
  }

  // ! add relogging before deleting
  deleteUser(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const user = this.auth.currentUser;
      if (!user) {
        reject(new Error('User is not signed in.'));
        return;
      }

      deleteUser(user)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
          reject(error);
        });
    });
  }

  private displayError(error: FirebaseError) {
    let errorMessage = 'An error occurred during authentication.';

    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password.';
    }

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already in use.';
    }

    this.authErrorSubject.next(errorMessage);
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
