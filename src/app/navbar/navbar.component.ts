import { Component, Input } from '@angular/core';
import { Avatar } from '../avatar.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { StorageService } from '../storage.service';
import { AuthService } from '../auth.service';
import { User } from '@angular/fire/auth';
import { DialogService } from '../dialog.service';
import { AppService } from '../app.service';

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
    private appService: AppService
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

  handleSignOut() {
    this.authService.signOutUser();
  }
}
