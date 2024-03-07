import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddListDialogComponent } from './add-list-dialog/add-list-dialog.component';
import { AddReminderDialogComponent } from './add-reminder-dialog/add-reminder-dialog.component';
import { EditListDialogComponent } from './edit-list-dialog/edit-list-dialog.component';
import { List } from './list.model';
import { Reminder } from './reminder.model';
import { EditReminderDialogComponent } from './edit-reminder-dialog/edit-reminder-dialog.component';
import { EditUserProfileDialogComponent } from './edit-user-profile-dialog/edit-user-profile-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openAddListDialog(): void {
    this.dialog.open(AddListDialogComponent);
  }

  openEditListDialog(list: List): void {
    this.dialog.open(EditListDialogComponent, {
      data: list,
    });
  }

  openAddReminderDialog(): void {
    this.dialog.open(AddReminderDialogComponent);
  }

  openEditReminderDialog(reminder: Reminder): void {
    this.dialog.open(EditReminderDialogComponent, {
      data: reminder,
    });
  }

  openEditProfileDialog(): void {
    this.dialog.open(EditUserProfileDialogComponent);
  }
}
