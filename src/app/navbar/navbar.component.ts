import { Component, Input } from '@angular/core';
import { Avatar } from '../avatar.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { StorageService } from '../storage.service';
import { AuthService } from '../auth.service';
import { User } from '@angular/fire/auth';
import { DialogService } from '../dialog.service';
import { List } from '../list.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Input({ required: true }) selectedList!: List | null;
  @Input({ required: true }) avatarOptions!: Avatar[] | null;
  currentUser$!: BehaviorSubject<User | null>;
  userAvatar: Avatar | null = null;
  private avatarSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private dialogService: DialogService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.getCurrentUser$();

    this.avatarSubscription = this.storageService
      .getUserAvatar()
      .subscribe((avatar) => {
        if (!avatar) return;

        this.userAvatar = avatar;
      });
  }

  openAddListDialog(): void {
    this.dialogService.openAddListDialog();
  }

  openAddReminderDialog(): void {
    this.dialogService.openAddReminderDialog(this.selectedList);
  }

  onEditProfile(): void {
    const user = this.currentUser$.getValue();

    if (!user || !user.displayName || !this.userAvatar || !this.avatarOptions)
      return;

    this.dialogService.openEditProfileDialog({
      username: user.displayName,
      userAvatar: this.userAvatar,
      avatarOptions: this.avatarOptions,
    });
  }

  handleSignOut() {
    this.authService.signOutUser();
  }

  ngOnDestroy(): void {
    if (this.avatarSubscription) this.avatarSubscription.unsubscribe();
  }
}
