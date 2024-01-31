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
    this.listsSubscription = this.firestoreService.lists$.subscribe((lists) => {
      this.userLists = lists;
      this.isLoading.lists = false;
    });
    this.remindersSubscription = this.firestoreService.reminders$.subscribe(
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

  handleListClick(list: List) {
    this.selectedList = list;
  }

  listHasNoReminders() {
    if (!this.selectedList) return false;

    return (
      this.userReminders.filter(
        (reminder) => reminder.listId === this.selectedList?.id
      ).length === 0
    );
  }

  ngOnDestroy(): void {
    this.listsSubscription.unsubscribe();
    this.remindersSubscription.unsubscribe();
  }
}
