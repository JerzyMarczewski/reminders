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
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  private authErrorSubject = new BehaviorSubject<string | null>(null);
  authError$ = this.authErrorSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(public auth: Auth, private snackBar: MatSnackBar) {
    this.user$ = user(auth);
    this.user$.subscribe(this.currentUserSubject);
  }

  getCurrentUser$(): BehaviorSubject<User | null> {
    return this.currentUserSubject;
  }

  createUser(username: string, email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const defaultAvatarPath = 'avatars/0.png';

        return updateProfile(user, {
          displayName: username,
          photoURL: defaultAvatarPath,
        });
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
        // ! change later
        console.log('User logged out successfully');
      })
      .catch((error) => {
        console.error('Error while logging out:', error);
      });
  }

  editProfile(username: string, avatarPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
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

          this.currentUserSubject.next(updatedUser);
          resolve();
        })
        .catch((error) => {
          console.error('Error updating display name:', error);
          reject(error);
        });
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
