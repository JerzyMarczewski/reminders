import { Component, Input, ViewChild } from '@angular/core';
import { Reminder } from '../reminder.model';
import { MatRadioButton } from '@angular/material/radio';
import { FirestoreService } from '../firestore.service';
import { DialogService } from '../dialog.service';
import { Timestamp } from '@angular/fire/firestore';
import { Subscription, interval } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.component.html',
  styleUrl: './reminder.component.scss',
  animations: [
    trigger('fillCircleAnimation', [
      state('uncompleted', style({ backgroundSize: '0 0' })),
      state('completed', style({ backgroundSize: '100% 100%' })),
      transition('uncompleted <=> completed', [animate('0.3s ease-in-out')]),
    ]),
    trigger('crossTextAnimation', [
      state('uncompleted', style({ width: 0 })),
      state('completed', style({ width: '100%' })),
      transition('uncompleted <=> completed', [animate('0.5s ease-in-out')]),
    ]),
  ],
})
export class ReminderComponent {
  @Input({ required: true }) reminder!: Reminder;
  @Input({ required: true }) listColor!: string | undefined;
  private timerSubscription: Subscription | undefined;
  overdueDate?: boolean;
  reminderAnimationState!: 'uncompleted' | 'completed';

  constructor(
    private firestoreService: FirestoreService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.reminderAnimationState = this.reminder.completed
      ? 'completed'
      : 'uncompleted';

    if (this.reminder.dueDate) {
      this.overdueDate = this.isOverdueDate(this.reminder.dueDate!);

      this.timerSubscription = interval(1000).subscribe(() => {
        this.overdueDate = this.isOverdueDate(this.reminder.dueDate!);
      });
    }
  }

  isOverdueDate(dueDateTimestamp: Timestamp) {
    const currentDate = new Date();
    const currentDateInSeconds = currentDate.getTime() / 1000;

    // ? possiblity for an alert here

    if (dueDateTimestamp.seconds <= currentDateInSeconds) return true;

    return false;
  }

  toggleReminder() {
    const timeout = 1000;
    // change later
    this.reminderAnimationState =
      this.reminderAnimationState === 'completed' ? 'uncompleted' : 'completed';

    setTimeout(() => {
      this.firestoreService.toggleReminderCompletion(this.reminder);
    }, timeout);
  }

  openReminderInfo() {
    this.dialogService.openEditReminderDialog(this.reminder);
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }
}
