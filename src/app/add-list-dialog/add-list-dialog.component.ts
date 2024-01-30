import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogService } from '../dialog.service';
import { FirestoreService } from '../firestore.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-list-dialog',
  templateUrl: './add-list-dialog.component.html',
  styleUrls: ['./add-list-dialog.component.scss'],
})
export class AddListDialogComponent {
  listNameFormControl = new FormControl('', Validators.required);
  listDescription: string = '';

  constructor(
    private dialogRef: MatDialogRef<AddListDialogComponent>,
    private firestoreService: FirestoreService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  getErrorMessage() {
    console.log(this.listNameFormControl.status);
    if (this.listNameFormControl.hasError('required'))
      return 'You must enter a value';

    return '';
  }

  onSubmit(): void {
    if (!this.listNameFormControl.value) return;

    this.firestoreService.addList(
      this.listNameFormControl.value,
      this.listDescription
    );

    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
