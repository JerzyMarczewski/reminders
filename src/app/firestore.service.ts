import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, Subscription, switchMap } from 'rxjs';
import { Reminder } from './reminder.model';
import { List } from './list.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  lists$: Observable<List[]>;
  reminders$: Observable<Reminder[]>;

  listsCollection!: CollectionReference;
  remindersCollection!: CollectionReference;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.listsCollection = collection(this.firestore, 'lists');
    this.remindersCollection = collection(this.firestore, 'reminders');

    this.lists$ = authService.uid$.pipe(
      switchMap((uid) => {
        if (uid) {
          const userListsQuery = query(
            this.listsCollection,
            where('userId', '==', uid)
          );
          return collectionData(userListsQuery) as Observable<List[]>;
        } else {
          return [];
        }
      })
    );
    this.reminders$ = authService.uid$.pipe(
      switchMap((uid) => {
        if (uid) {
          const userRemindersQuery = query(
            this.remindersCollection,
            where('userId', '==', uid)
          );
          return collectionData(userRemindersQuery) as Observable<Reminder[]>;
        } else {
          return [];
        }
      })
    );
  }

  addList() {
    addDoc(this.listsCollection, <List>{
      name: 'test',
      description: 'test',
      userId: 'test',
    }).then((documentReference: DocumentReference) => {
      console.log(documentReference);
    });
  }
  addReminder() {
    addDoc(this.remindersCollection, <Reminder>{
      title: 'test',
      description: 'test',
      dueDate: new Date(),
      completed: false,
      userId: 'test',
      listId: 'test',
    }).then((documentReference: DocumentReference) => {
      console.log(documentReference);
    });
  }
}
