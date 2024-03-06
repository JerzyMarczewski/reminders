import { Component, Inject } from '@angular/core';
import { listColors, listIcons } from '../list-options';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from '../firestore.service';
import { List } from '../list.model';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-edit-list-dialog',
  templateUrl: './edit-list-dialog.component.html',
  styleUrl: './edit-list-dialog.component.scss',
  animations: [
    trigger('iconChange', [
      state('void', style({ opacity: 1, transform: 'scale(1) rotate(0)' })),
      state('shown', style({ opacity: 1, transform: 'scale(1) rotate(0)' })),
      state(
        'hidden',
        style({ opacity: 0, transform: 'scale(0) rotate(-90deg)' })
      ),
      transition('* => *', [animate('0.3s ease-in-out')]),
    ]),
  ],
})
export class EditListDialogComponent {
  readonly options = {
    colors: listColors,
    icons: listIcons,
  };
  editListFormGroup!: FormGroup;
  delayedIcon!: string;
  iconAnimationState: 'void' | 'shown' | 'hidden' = 'void';

  constructor(
    private dialogRef: MatDialogRef<EditListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: List,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.editListFormGroup = new FormGroup({
      name: new FormControl(this.data.name, [Validators.required]),
      color: new FormControl(this.data.color, [Validators.required]),
      icon: new FormControl(this.data.icon, [Validators.required]),
    });

    this.delayedIcon = this.editListFormGroup.value.icon;
  }

  handleColorSelect(color: string) {
    this.editListFormGroup.patchValue({
      color: color,
    });
  }

  handleIconSelect(icon: string): void {
    if (this.delayedIcon === icon) return;

    this.iconAnimationState = 'hidden';

    this.editListFormGroup.patchValue({
      icon: icon,
    });

    setTimeout(() => {
      this.iconAnimationState = 'shown';
      this.delayedIcon = icon;
    }, 300);
  }

  onSubmit(): void {
    if (this.editListFormGroup.valid && this.editListFormGroup.value) {
      const updatedList: List = {
        id: this.data.id,
        ...this.editListFormGroup.value,
      };

      this.firestoreService.editList(updatedList);
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
