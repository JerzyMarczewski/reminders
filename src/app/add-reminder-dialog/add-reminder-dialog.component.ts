import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { List } from '../list.model';
import { Observable } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { AppService } from '../app.service';

@Component({
  selector: 'app-add-reminder-dialog',
  templateUrl: './add-reminder-dialog.component.html',
  styleUrl: './add-reminder-dialog.component.scss',
})
export class AddReminderDialogComponent {
  addReminderFormGroup!: FormGroup;
  lists$!: Observable<List[]>;

  constructor(
    private dialogRef: MatDialogRef<AddReminderDialogComponent>,
    private appService: AppService,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.lists$ = this.firestoreService.userLists$;

    const listId = this.appService.getSelectedList()?.id ?? null;

    this.addReminderFormGroup = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      dueDate: new FormControl<Date | null>(null),
      dueTime: new FormControl<string | null>(null),
      listId: new FormControl<string | null>(listId, [Validators.required]),
    });
  }

  onSubmit(): void {
    if (!this.addReminderFormGroup.valid) return;

    const dueDate = this.addReminderFormGroup.get('dueDate')?.value;
    const dueTime = this.addReminderFormGroup.get('dueTime')?.value;

    console.log(typeof dueTime);

    const selectedDate: Date | undefined = dueDate;

    if (selectedDate && dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);

      selectedDate.setHours(hours);
      selectedDate.setMinutes(minutes);
    }

    const selectedDateTimestamp: Timestamp | undefined = selectedDate
      ? Timestamp.fromDate(selectedDate)
      : undefined;

    this.firestoreService.addReminder(
      this.addReminderFormGroup.value.title,
      this.addReminderFormGroup.value.listId,
      this.addReminderFormGroup.value.description,
      selectedDateTimestamp
    );

    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
