import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  from,
  map,
  of,
  take,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  username$: Observable<string | null>;
  private authErrorSubject = new BehaviorSubject<string | null>(null);
  authError$ = this.authErrorSubject.asObservable();
  displayName$: Observable<string | null>;

  constructor(public auth: Auth, private snackBar: MatSnackBar) {
    this.user$ = user(auth);
    this.username$ = this.user$.pipe(
      map((user) => (user ? user.displayName : null))
    );
    this.displayName$ = of(this.auth.currentUser?.displayName ?? null);
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
        console.log('User logged out successfully');
      })
      .catch((error) => {
        console.error('Error while logging out:', error);
      });
  }

  editProfile(username: string, avatarPath: string) {
    if (!this.auth.currentUser) return;

    updateProfile(this.auth.currentUser, {
      displayName: username,
      photoURL: avatarPath,
    })
      .then(() => this.auth.signOut())
      .catch((error) => {
        console.error(error);
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
