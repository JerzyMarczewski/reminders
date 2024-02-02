import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  user,
} from '@angular/fire/auth';
import { Observable, Subscription, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  uid!: string | null;
  userSubscription!: Subscription;

  constructor(private auth: Auth) {
    this.user$ = user(auth);
  }

  createUser(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // ! DELETE LATER
        console.log('User added to the DB');
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
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  }
}
