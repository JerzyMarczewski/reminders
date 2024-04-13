import { Component } from '@angular/core';
import { List } from '../list.model';
import { FirestoreService } from '../firestore.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrl: './list-panel.component.scss',
})
export class ListPanelComponent {
  lists$!: Observable<List[]>;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.lists$ = this.firestoreService.userLists$;
  }
}
