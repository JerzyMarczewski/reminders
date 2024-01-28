import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  Query,
  addDoc,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { Reminder } from './reminder.model';
import { List } from './list.model';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  lists$!: Observable<List[]>;
  reminders$!: Observable<Reminder[]>;

  listsCollection!: CollectionReference;
  remindersCollection!: CollectionReference;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.listsCollection = collection(this.firestore, 'lists');
    this.remindersCollection = collection(this.firestore, 'reminders');

    this.lists$ = authService.user$.pipe(
      switchMap((user: User | null) => {
        if (user && user.uid) {
          const userListsQuery = query(
            this.listsCollection,
            where('userId', '==', user.uid)
          );
          return collectionData(userListsQuery, {
            idField: 'id',
          }) as Observable<List[]>;
        } else {
          return [];
        }
      })
    );

    this.reminders$ = authService.user$.pipe(
      switchMap((user: User | null) => {
        if (user && user.uid) {
          const userRemindersQuery = query(
            this.remindersCollection,
            where('userId', '==', user.uid)
          );
          return collectionData(userRemindersQuery, {
            idField: 'id',
          }) as Observable<Reminder[]>;
        } else {
          return [];
        }
      })
    );
  }

  addList(name: string, description: string) {
    if (!this.authService.uid)
      return console.error(
        'Could not add a new list, because the user is not authenticated'
      );

    const newList: Partial<List> = {
      name: name,
      description: description,
      userId: this.authService.uid,
    };

    return addDoc(this.listsCollection, newList);
  }

  addReminder(
    title: string,
    listId: string,
    completed: boolean = false,
    description?: string,
    dueDate?: Date
  ) {
    if (!this.authService.uid)
      return console.error(
        'Could not add a new list, because the user is not authenticated'
      );

    const newReminder: Partial<Reminder> = {
      title: title,
      completed: completed,
      userId: this.authService.uid,
      listId: listId,
    };

    if (description) newReminder.description = description;
    if (dueDate) newReminder.dueDate = dueDate;

    return addDoc(this.remindersCollection, newReminder);
  }
}
