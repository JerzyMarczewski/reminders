import { Component, Input } from '@angular/core';
import { List } from '../list.model';
import { FirestoreService } from '../firestore.service';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  @Input({ required: true }) list!: List;
  uncompletedReminders$!: Observable<number>;
  selectedList$!: Observable<List | null>;

  constructor(
    private firestoreService: FirestoreService,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.uncompletedReminders$ =
      this.firestoreService.getNumberOfUncompletedReminders$(this.list);

    this.selectedList$ = this.appService.selectedList$;
  }

  handleListSelect() {
    this.appService.setSelectedList(this.list);
  }
}
