import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Reminder } from '../reminder.model';
import { List } from '../list.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  userLists: List[] = [];
  userReminders: Reminder[] = [];
  private listsSubscription!: Subscription;
  private remindersSubscription!: Subscription;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.listsSubscription = this.firestoreService.lists$.subscribe((lists) => {
      this.userLists = lists;
    });
    this.remindersSubscription = this.firestoreService.reminders$.subscribe(
      (reminders) => {
        this.userReminders = reminders;
      }
    );
  }

  ngOnDestroy(): void {
    this.listsSubscription.unsubscribe();
    this.remindersSubscription.unsubscribe();
  }
}
