import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Reminder } from '../reminder.model';
import { List } from '../list.model';
import { Observable, Subscription } from 'rxjs';
import { DialogService } from '../dialog.service';
import { HighlightDirective } from '../highlight.directive';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  isLoading = {
    lists: true,
    reminders: true,
  };
  selectedList: List | undefined = undefined;
  userLists: List[] = [];
  userReminders: Reminder[] = [];
  private listsSubscription!: Subscription;
  private remindersSubscription!: Subscription;

  constructor(
    private firestoreService: FirestoreService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.listsSubscription = this.firestoreService.userLists$.subscribe(
      (lists) => {
        this.userLists = lists.sort(
          (list1, list2) =>
            list1.creationDate.seconds - list2.creationDate.seconds
        );

        if (this.isLoading.lists && this.userLists)
          this.selectedList = this.userLists[0];

        this.isLoading.lists = false;

        const newSelectedList = this.userLists.find(
          (list) => list.id === this.selectedList?.id
        );

        if (newSelectedList) this.selectedList = newSelectedList;
        else this.selectedList = undefined;
      }
    );

    this.remindersSubscription = this.firestoreService.userReminders$.subscribe(
      (reminders) => {
        this.userReminders = reminders;
        this.isLoading.reminders = false;
      }
    );
  }

  openAddListDialog(): void {
    this.dialogService.openAddListDialog();
  }

  openAddReminderDialog(): void {
    this.dialogService.openAddReminderDialog();
  }

  changeSelectedList(list: List) {
    this.selectedList = list;
  }

  ngOnDestroy(): void {
    this.listsSubscription.unsubscribe();
    this.remindersSubscription.unsubscribe();
  }
}
