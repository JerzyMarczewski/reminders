import { Component, EventEmitter, Input, Output } from '@angular/core';
import { List } from '../list.model';
import { Reminder } from '../reminder.model';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrl: './list-panel.component.scss',
})
export class ListPanelComponent {
  @Input({ required: true }) userLists!: List[];
  @Input({ required: true }) userReminders!: Reminder[];
  @Input({ required: true }) selectedList!: List | undefined;
  @Output() listSelect = new EventEmitter<List>();

  handleSelectListEvent(list: List): void {
    this.listSelect.emit(list);
  }

  countListUncompletedReminders(list: List): number {
    return this.userReminders.filter(
      (reminder) => !reminder.completed && reminder.listId === list.id
    ).length;
  }
}
