import { Component, Input } from '@angular/core';
import { List } from '../list.model';
import { Reminder } from '../reminder.model';
import { DialogService } from '../dialog.service';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-selected-list-panel',
  templateUrl: './selected-list-panel.component.html',
  styleUrl: './selected-list-panel.component.scss',
})
export class SelectedListPanelComponent {
  @Input({ required: true }) selectedList!: List | undefined;
  @Input({ required: true }) userReminders: Reminder[] = [];

  completedRemindersShown = false;

  constructor(
    private dialogService: DialogService,
    private firestoreService: FirestoreService
  ) {}

  getSelectedListReminders(): Reminder[] {
    if (!this.selectedList) return [];

    return this.userReminders.filter(
      (reminder) => reminder.listId === this.selectedList!.id
    );
  }

  getRemindersSortedByCompletion(): Reminder[] {
    const reminders = this.getSelectedListReminders();

    return reminders.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  getShownReminders() {
    const reminders = this.getRemindersSortedByCompletion();

    if (this.completedRemindersShown) return reminders;

    return reminders.filter((reminder) => !reminder.completed);
  }

  listHasNoReminders(): boolean {
    if (!this.selectedList) return false;

    return (
      this.userReminders.filter(
        (reminder) => reminder.listId === this.selectedList?.id
      ).length === 0
    );
  }

  handleEditListInfoClick(list: List) {
    this.dialogService.openEditListDialog(list);
  }

  hanleEditReminderInfoClick(reminder: Reminder) {
    this.dialogService.openEditReminderDialog(reminder);
  }

  handleShowCompletedToggle(): void {
    this.completedRemindersShown = !this.completedRemindersShown;
  }

  handleDeleteClick(listId: string): void {
    this.firestoreService.deleteList(listId);
  }
}
