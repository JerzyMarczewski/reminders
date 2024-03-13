import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { StorageService } from '../storage.service';
import { AuthService } from '../auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Avatar } from '../avatar.model';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-edit-user-profile-dialog',
  templateUrl: './edit-user-profile-dialog.component.html',
  styleUrl: './edit-user-profile-dialog.component.scss',
})
export class EditUserProfileDialogComponent {
  profileForm!: FormGroup;
  currentUser$!: BehaviorSubject<User | null>;
  avatarOptions$!: Observable<Avatar[]>;

  constructor(
    private dialogRef: MatDialogRef<EditUserProfileDialogComponent>,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.avatarOptions$ = this.storageService.allAvatarsSorted$;

    const username = this.currentUser$.getValue()?.displayName;
    const selectedAvatarPath = this.currentUser$.getValue()?.photoURL;

    this.profileForm = new FormGroup({
      username: new FormControl<string | null>(username ?? null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25),
        Validators.pattern('[a-zA-Z0-9]*'),
      ]),
      avatarPath: new FormControl<string | null>(selectedAvatarPath ?? null, [
        Validators.required,
      ]),
    });
  }

  handleAvatarSelect(avatarPath: string): void {
    this.profileForm.patchValue({
      avatarPath: avatarPath,
    });
  }

  onSubmit(): void {
    if (!this.profileForm.valid) return;

    const username = this.profileForm.get('username')?.value;
    const avatarPath = this.profileForm.get('avatarPath')?.value;
    if (!username || !avatarPath) return;

    this.authService.editProfile(username, avatarPath);

    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
