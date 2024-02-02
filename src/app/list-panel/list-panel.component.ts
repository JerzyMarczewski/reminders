import { Component, EventEmitter, Input, Output } from '@angular/core';
import { List } from '../list.model';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrl: './list-panel.component.scss',
})
export class ListPanelComponent {
  @Input({ required: true }) userLists!: List[];
  @Input({ required: true }) selectedList!: List | undefined;
  @Output() listSelect = new EventEmitter<List>();

  selectList(list: List): void {
    this.listSelect.emit(list);
  }
}
