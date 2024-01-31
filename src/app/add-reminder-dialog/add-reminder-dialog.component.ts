import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Reminder } from '../reminder.model';
import { List } from '../list.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-reminder-dialog',
  templateUrl: './add-reminder-dialog.component.html',
  styleUrl: './add-reminder-dialog.component.scss',
})
export class AddReminderDialogComponent {
  addReminderFormGroup!: FormGroup;
  userLists: List[] = [];
  private listsSubscription!: Subscription;

  constructor(
    private dialogRef: MatDialogRef<AddReminderDialogComponent>,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.addReminderFormGroup = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      dueDate: new FormControl<Date | null>(null),
      list: new FormControl<List | null>(null, [Validators.required]),
    });

    this.listsSubscription = this.firestoreService.lists$.subscribe((lists) => {
      this.userLists = lists;
    });
  }

  get title() {
    return this.addReminderFormGroup.get('title');
  }
  get list() {
    return this.addReminderFormGroup.get('list');
  }

  onSubmit(): void {
    console.log(
      this.addReminderFormGroup.value.title,
      this.addReminderFormGroup.value.list.id,
      this.addReminderFormGroup.value.description,
      this.addReminderFormGroup.value.dueDate
    );
    if (this.addReminderFormGroup.valid) {
      this.firestoreService.addReminder(
        this.addReminderFormGroup.value.title,
        this.addReminderFormGroup.value.list.id,
        this.addReminderFormGroup.value.description,
        this.addReminderFormGroup.value.dueDate
      );
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
