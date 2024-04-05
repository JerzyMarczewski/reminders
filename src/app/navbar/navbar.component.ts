import { Component } from '@angular/core';
import { Avatar } from '../avatar.model';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { StorageService } from '../storage.service';
import { AuthService } from '../auth.service';
import { User } from '@angular/fire/auth';
import { DialogService } from '../dialog.service';
import { AppService } from '../app.service';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  currentUser$!: BehaviorSubject<User | null>;
  userAvatar$!: Observable<Avatar | null>;
  userImageLoading$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private dialogService: DialogService,
    private storageService: StorageService,
    private appService: AppService,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.userAvatar$ = this.storageService.userAvatar$;
    this.userImageLoading$ = this.appService.userImageLoading$;
  }

  openAddListDialog(): void {
    this.dialogService.openAddListDialog();
  }

  openAddReminderDialog(): void {
    this.dialogService.openAddReminderDialog();
  }

  onEditProfile(): void {
    const user = this.currentUser$.getValue();

    if (!user || !user.displayName) return;

    this.dialogService.openEditProfileDialog();
  }

  handleImageLoading(e: Event): void {
    this.appService.setUserImageLoading(false);
  }

  handleSignOut(): void {
    this.dialogService
      .openConfirmationDialog('Are you sure you want to sign out?')
      .pipe(take(1))
      .subscribe((result) => {
        if (result) this.authService.signOutUser();
      });
  }

  handleDeleteUser(): void {
    this.dialogService
      .openReenterCredentialsDialog('Delete Account')
      .pipe(take(1))
      .subscribe((result) => {
        if (result === null) return;

        const { email, password } = result;
        this.firestoreService.deleteUserAndAllData(email, password);
      });
  }
}
