import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-list-dialog',
  templateUrl: './add-list-dialog.component.html',
  styleUrls: ['./add-list-dialog.component.scss'],
})
export class AddListDialogComponent {
  readonly options = {
    colors: [
      '#45B3E7',
      '#0078ff',
      '#bd00ff',
      '#d696bb',
      '#fa3c4c',
      '#ff9a00',
      '#fff000',
      '#01ff1f',
      '#41bc66',
      '#967259',
      '#444444',
    ],
    icons: [
      'format_list_bulleted',
      'bookmark',
      'push_pin',
      'card_giftcard',
      'cake',
      'school',
      'article',
      'money',
      'music_note',
      'people',
      'shopping_cart',
      'airplanemode_on',
      'train',
      'directions_bus',
    ],
  };
  addListFormGroup!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddListDialogComponent>,
    private firestoreService: FirestoreService
  ) {
    this.addListFormGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      color: new FormControl(this.options.colors[0], [Validators.required]),
      icon: new FormControl(this.options.icons[0], [Validators.required]),
    });
  }

  get name() {
    return this.addListFormGroup.get('name');
  }
  get icon() {
    return this.addListFormGroup.get('icon');
  }

  onSubmit(): void {
    if (this.addListFormGroup.valid && this.addListFormGroup.value) {
      this.firestoreService.addList(
        this.addListFormGroup.value.name,
        this.addListFormGroup.value.color,
        this.addListFormGroup.value.icon
      );
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
