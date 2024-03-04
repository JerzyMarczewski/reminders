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
      dueDate: new FormControl<Date | undefined>(previousDueDate),
      dueTime: new FormControl<string | undefined>(previousDueTime),
      completed: new FormControl<boolean>(this.data.completed),
      listId: new FormControl<string>(this.data.listId, [Validators.required]),
    });

    this.listsSubscription = this.firestoreService.userLists$.subscribe(
      (lists) => {
        this.userLists = lists;
      }
    );
  }

  ngOnDestroy() {
    this.listsSubscription.unsubscribe();
  }

  get title() {
    return this.editReminderFormGroup.get('title');
  }
  get dueDate() {
    return this.editReminderFormGroup.get('dueDate');
  }
  get dueTime() {
    return this.editReminderFormGroup.get('dueTime');
  }
  get list() {
    return this.editReminderFormGroup.get('list');
  }

  getDateFromTimestamp(timestamp: Timestamp | undefined) {
    return timestamp ? new Date(timestamp.seconds * 1000) : undefined;
  }

  getTimeFromDate(date: Date | undefined): string | undefined {
    if (!date) return undefined;

    const hours = `${date.getHours()}`;
    const minutes = `${date.getMinutes()}`;

    const hoursIn2digits = hours.length === 1 ? '0' + hours : hours;
    const minutesIn2digits = minutes.length === 1 ? '0' + minutes : minutes;

    return `${hoursIn2digits}:${minutesIn2digits}`;
  }

  getTimestampFromDate(date: Date | undefined, time: string | undefined) {
    if (!date) return undefined;
    if (!time) return Timestamp.fromDate(date);

    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);

    return Timestamp.fromDate(date);
  }

  getListInputError(): string {
    if (!this.userLists.length) return 'You must first create a list';
    else if (this.list?.errors?.['required']) return 'You must choose a value';
    else return '';
  }

  onSubmit(): void {
    if (!this.editReminderFormGroup.valid) return;

    this.firestoreService.editReminder(
      this.data.id,
      this.data.creationDate,
      this.editReminderFormGroup.value.title,
      this.editReminderFormGroup.value.completed,
      this.data.userId,
      this.editReminderFormGroup.value.listId,
      this.editReminderFormGroup.value.description,
      this.getTimestampFromDate(this.dueDate?.value, this.dueTime?.value)
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
}
