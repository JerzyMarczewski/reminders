import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable, map } from 'rxjs';
import { Reminder } from './reminder.model';
import { List } from './list.model';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  uid$: Observable<string | null>;
  constructor(private router: Router, private authService: AuthService) {
    this.uid$ = this.authService.uid$;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
