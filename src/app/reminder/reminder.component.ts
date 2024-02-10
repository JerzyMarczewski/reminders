import { Component, Input, ViewChild } from '@angular/core';
import { Reminder } from '../reminder.model';
import { MatRadioButton } from '@angular/material/radio';
import { FirestoreService } from '../firestore.service';
import { DialogService } from '../dialog.service';
import { Timestamp } from '@angular/fire/firestore';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.component.html',
  styleUrl: './reminder.component.scss',
})
export class ReminderComponent {
  @Input({ required: true }) reminder!: Reminder;
  @Input({ required: true }) listColor!: string | undefined;
  private timerSubscription: Subscription | undefined;
  overdueDate?: boolean;

  constructor(
    private firestoreService: FirestoreService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    if (this.reminder.dueDate) {
      this.overdueDate = this.isOverdueDate(this.reminder.dueDate!);

      this.timerSubscription = interval(1000).subscribe(() => {
        this.overdueDate = this.isOverdueDate(this.reminder.dueDate!);
      });
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }

  isOverdueDate(dueDateTimestamp: Timestamp) {
    const currentDate = new Date();
    const currentDateInSeconds = currentDate.getTime() / 1000;

    // ? possiblity for an alert here

    if (dueDateTimestamp.seconds <= currentDateInSeconds) return true;
    else return false;
  }

  toggleReminder() {
    this.firestoreService.toggleReminderCompletion(this.reminder);
  }

  openReminderInfo() {
    this.dialogService.openEditReminderDialog(this.reminder);
  }
}
