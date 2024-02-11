import { Component, EventEmitter, Input, Output } from '@angular/core';
import { List } from '../list.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  @Input({ required: true }) list!: List;
  @Input({ required: true }) selected!: boolean;
  @Input({ required: true }) uncompletedReminders!: number;

  @Output() listSelectEvent = new EventEmitter<List>();

  emitSelectionToPanel() {
    this.listSelectEvent.emit(this.list);
  }
}
