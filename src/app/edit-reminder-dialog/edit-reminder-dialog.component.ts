import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { List } from '../list.model';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { Reminder } from '../reminder.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-edit-reminder-dialog',
  templateUrl: './edit-reminder-dialog.component.html',
  styleUrl: './edit-reminder-dialog.component.scss',
})
export class EditReminderDialogComponent {
  editReminderFormGroup!: FormGroup;
  userLists: List[] = [];
  private listsSubscription!: Subscription;

  constructor(
    private dialogRef: MatDialogRef<EditReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Reminder,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    const previousDueDate = this.getDateFromTimestamp(this.data.dueDate);
    const previousDueTime = this.getTimeFromDate(previousDueDate);

    this.editReminderFormGroup = new FormGroup({
      title: new FormControl(this.data.title, [Validators.required]),
      description: new FormControl(this.data.description),
      dueDate: new FormControl<Date | null>(previousDueDate),
      dueTime: new FormControl<string | null>(previousDueTime),
      completed: new FormControl<boolean>(this.data.completed),
      listId: new FormControl<string>(this.data.listId, [Validators.required]),
    });

    this.listsSubscription = this.firestoreService.userLists$.subscribe(
      (lists) => {
        this.userLists = lists;
      }
    );
  }

  private getDateFromTimestamp(timestamp: Timestamp | undefined): Date | null {
    return timestamp ? new Date(timestamp.seconds * 1000) : null;
  }

  private getTimeFromDate(date: Date | null): string | null {
    if (!date) return null;

    const hours = `${date.getHours()}`;
    const minutes = `${date.getMinutes()}`;

    const hoursIn2digits = hours.length === 1 ? '0' + hours : hours;
    const minutesIn2digits = minutes.length === 1 ? '0' + minutes : minutes;

    return `${hoursIn2digits}:${minutesIn2digits}`;
  }

  private getTimestampFromDate(
    date: Date | null,
    time: string | null
  ): Timestamp | undefined {
    if (!date) return undefined;
    if (!time) return Timestamp.fromDate(date);

    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);

    return Timestamp.fromDate(date);
  }

  onSubmit(): void {
    if (!this.editReminderFormGroup.valid) return;

    const dueDate = this.editReminderFormGroup.get('dueDate')?.value;
    const dueTime = this.editReminderFormGroup.get('dueTime')?.value;
    const newTimestamp = this.getTimestampFromDate(dueDate, dueTime);

    this.firestoreService.editReminder(
      this.data.id,
      this.data.creationDate,
      this.editReminderFormGroup.value.title,
      this.editReminderFormGroup.value.completed,
      this.data.userId,
      this.editReminderFormGroup.value.listId,
      this.editReminderFormGroup.value.description,
      newTimestamp
    );

    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.firestoreService.deleteReminder(this.data.id);

    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.listsSubscription.unsubscribe();
  }
}
