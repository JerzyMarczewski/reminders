import { Component, Input } from '@angular/core';
import { List } from '../list.model';
import { Reminder } from '../reminder.model';

@Component({
  selector: 'app-selected-list-panel',
  templateUrl: './selected-list-panel.component.html',
  styleUrl: './selected-list-panel.component.scss',
})
export class SelectedListPanelComponent {
  @Input({ required: true }) selectedList!: List | undefined;
  @Input({ required: true }) userReminders: Reminder[] = [];
  // @Output() listSelect = new EventEmitter<List>();

  listHasNoReminders() {
    if (!this.selectedList) return false;

    return (
      this.userReminders.filter(
        (reminder) => reminder.listId === this.selectedList?.id
      ).length === 0
    );
  }
}
