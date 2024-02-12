import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddListDialogComponent } from './add-list-dialog/add-list-dialog.component';
import { AddReminderDialogComponent } from './add-reminder-dialog/add-reminder-dialog.component';
import { EditListDialogComponent } from './edit-list-dialog/edit-list-dialog.component';
import { List } from './list.model';
import { Reminder } from './reminder.model';
import { EditReminderDialogComponent } from './edit-reminder-dialog/edit-reminder-dialog.component';

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

  openAddReminderDialog(selectedList: List | undefined): void {
    this.dialog.open(AddReminderDialogComponent, {
      data: selectedList,
    });
  }

  openEditReminderDialog(reminder: Reminder): void {
    this.dialog.open(EditReminderDialogComponent, {
      data: reminder,
    });
  }
}