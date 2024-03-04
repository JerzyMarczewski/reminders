import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { listColors, listIcons } from '../list-options';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-add-list-dialog',
  templateUrl: './add-list-dialog.component.html',
  styleUrls: ['./add-list-dialog.component.scss'],
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
export class AddListDialogComponent implements OnInit {
  readonly options = {
    colors: listColors,
    icons: listIcons,
  };
  addListFormGroup!: FormGroup;
  delayedIcon!: string;
  iconAnimationState: 'void' | 'shown' | 'hidden' = 'void';

  constructor(
    private dialogRef: MatDialogRef<AddListDialogComponent>,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.addListFormGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      color: new FormControl(this.options.colors[0], [Validators.required]),
      icon: new FormControl(this.options.icons[0], [Validators.required]),
    });

    this.delayedIcon = this.options.icons[0];
  }

  handleColorSelect(color: string) {
    this.addListFormGroup.patchValue({
      color: color,
    });
  }

  handleIconSelect(icon: string): void {
    if (this.delayedIcon === icon) return;

    this.iconAnimationState = 'hidden';

    this.addListFormGroup.patchValue({
      icon: icon,
    });

    setTimeout(() => {
      this.iconAnimationState = 'shown';
      this.delayedIcon = icon;
    }, 300);
  }

  onSubmit(): void {
    if (!this.addListFormGroup.valid) return;

    this.firestoreService.addList(
      this.addListFormGroup.value.name,
      this.addListFormGroup.value.color,
      this.addListFormGroup.value.icon
    );

    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
