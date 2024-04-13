import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reenter-credentials-dialog',
  templateUrl: './reenter-credentials-dialog.component.html',
  styleUrl: './reenter-credentials-dialog.component.scss',
})
export class ReenterCredentialsDialogComponent {
  credentialsFormGroup!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string },
    public dialogRef: MatDialogRef<ReenterCredentialsDialogComponent>
  ) {}

  ngOnInit() {
    this.credentialsFormGroup = new FormGroup({
      email: new FormControl<string>('', [Validators.required]),
      password: new FormControl<string>('', [Validators.required]),
    });
  }
}
