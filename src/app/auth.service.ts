import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(public auth: Auth, private snackbarService: SnackbarService) {
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
      .catch((error) => {
        this.snackbarService.displayFirebaseError(error);
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
          this.snackbarService.displayFirebaseError(error);
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
          this.snackbarService.displayFirebaseError(error);
          reject(error);
        });
    });
  }

  signInUser(email: string, password: string): void {
    signInWithEmailAndPassword(this.auth, email, password).catch((error) =>
      this.snackbarService.displayFirebaseError(error)
    );
  }

  signOutUser(): void {
    this.auth.signOut().catch((error) => {
      this.snackbarService.displayFirebaseError(
        error,
        'Error while signing out.'
      );
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
}
