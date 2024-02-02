import { Injectable } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { Reminder } from './reminder.model';
import { List } from './list.model';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  userLists$!: Observable<List[]>;
  userReminders$!: Observable<Reminder[]>;

  listsCollection!: CollectionReference;
  remindersCollection!: CollectionReference;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.listsCollection = collection(this.firestore, 'lists');
    this.remindersCollection = collection(this.firestore, 'reminders');

    this.userLists$ = authService.user$.pipe(
      switchMap((user: User | null) => {
        if (!user || !user.uid) return of([] as List[]);

        const userListsQuery = query(
          this.listsCollection,
          where('userId', '==', user.uid)
        );

        return collectionData(userListsQuery, {
          idField: 'id',
        }) as Observable<List[]>;
      })
    );

    this.userReminders$ = authService.user$.pipe(
      switchMap((user: User | null) => {
        if (!user || !user.uid) return of([] as Reminder[]);

        const userRemindersQuery = query(
          this.remindersCollection,
          where('userId', '==', user.uid)
        );

        return collectionData(userRemindersQuery, {
          idField: 'id',
        }) as Observable<Reminder[]>;
      })
    );
  }

  addList(name: string, color: string, icon: string) {
    if (!this.authService.uid)
      return console.error(
        'Could not add a new list, because the user is not authenticated'
      );

    const newList: Partial<List> = {
      creationDate: Timestamp.fromDate(new Date()),
      name: name,
      color: color,
      icon: icon,
      userId: this.authService.uid,
    };

    return addDoc(this.listsCollection, newList);
  }

  addReminder(
    title: string,
    listId: string,
    description?: string,
    dueDate?: Timestamp
  ) {
    if (!this.authService.uid)
      return console.error(
        'Could not add a new reminder, because the user is not authenticated'
      );

    const newReminder: Partial<Reminder> = {
      creationDate: Timestamp.fromDate(new Date()),
      title: title,
      completed: false,
      userId: this.authService.uid,
      listId: listId,
    };

    if (description) newReminder.description = description;
    if (dueDate) newReminder.dueDate = dueDate;

    return addDoc(this.remindersCollection, newReminder);
  }
}
