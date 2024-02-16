import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Reminder } from '../reminder.model';
import { List } from '../list.model';
import { Observable, Subscription, map } from 'rxjs';
import { DialogService } from '../dialog.service';
import { AuthService } from '../auth.service';

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
  username$!: Observable<string | null>;
  private listsSubscription!: Subscription;
  private remindersSubscription!: Subscription;

  constructor(
    private firestoreService: FirestoreService,
    private dialogService: DialogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username$ = this.authService.user$.pipe(
      map((user) => (user ? user.displayName : null))
    );

    this.authService.user$.subscribe((user) => {
      if (user) {
        this.listsSubscription = this.firestoreService.userLists$.subscribe(
          (lists) => {
            this.userLists = lists;

            this.isLoading.lists = false;

            const newSelectedList = this.userLists.find(
              (list) => list.id === this.selectedList?.id
            );

            if (newSelectedList) this.selectedList = newSelectedList;
            else this.selectedList = undefined;
          }
        );

        this.remindersSubscription =
          this.firestoreService.userReminders$.subscribe((reminders) => {
            this.userReminders = reminders;
            this.isLoading.reminders = false;
          });
      }
    });
  }

  openAddListDialog(): void {
    this.dialogService.openAddListDialog();
  }

  openAddReminderDialog(): void {
    this.dialogService.openAddReminderDialog(this.selectedList);
  }

  changeSelectedList(list: List) {
    this.selectedList = list;
  }

  handleSignOut() {
    this.authService.signOutUser();
  }

  ngOnDestroy(): void {
    if (this.listsSubscription) this.listsSubscription.unsubscribe();
    if (this.remindersSubscription) this.remindersSubscription.unsubscribe();
  }
}
