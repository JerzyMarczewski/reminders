import { Injectable } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, iif, of, switchMap, map } from 'rxjs';
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

  currentUid!: string | undefined;

  listsCollection!: CollectionReference;
  remindersCollection!: CollectionReference;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.listsCollection = collection(this.firestore, 'lists');
    this.remindersCollection = collection(this.firestore, 'reminders');

    this.userLists$ = authService.user$.pipe(
      switchMap((user) =>
        iif(
          () => user !== null && user.uid !== null,
          this.getUserListsData(user!.uid),
          of([] as List[])
        )
      ),
      map((lists) =>
        lists.sort(
          (list1, list2) =>
            list1.creationDate.seconds - list2.creationDate.seconds
        )
      )
    );

    this.userReminders$ = authService.user$.pipe(
      switchMap((user) =>
        iif(
          () => user !== null && user.uid !== null,
          this.getUserRemindersData(user!.uid),
          of([] as Reminder[])
        )
      ),
      map((reminders) =>
        reminders.sort(
          (reminder1, reminder2) =>
            reminder1.creationDate.seconds - reminder2.creationDate.seconds
        )
      )
    );

    this.authService.user$.subscribe(
      (user: User | null) => (this.currentUid = user?.uid)
    );
  }

  private getUserListsData(uid: string) {
    const userListsQuery = query(
      this.listsCollection,
      where('userId', '==', uid)
    );

    return collectionData(userListsQuery, {
      idField: 'id',
    }) as Observable<List[]>;
  }

  private getUserRemindersData(uid: string) {
    const userRemindersQuery = query(
      this.remindersCollection,
      where('userId', '==', uid)
    );

    return collectionData(userRemindersQuery, {
      idField: 'id',
    }) as Observable<Reminder[]>;
  }

  addList(name: string, color: string, icon: string) {
    if (!this.currentUid)
      return console.error(
        'Could not add a new list, because the user is not authenticated'
      );

    const newList: Partial<List> = {
      creationDate: Timestamp.fromDate(new Date()),
      name: name,
      color: color,
      icon: icon,
      userId: this.currentUid,
    };

    return addDoc(this.listsCollection, newList);
  }

  editList(updatedList: List) {
    if (!this.currentUid)
      return console.error(
        'Could not edit list, because the user is not authenticated'
      );

    const listRef = doc(this.firestore, 'lists', updatedList.id);

    const { id, ...updatedListWithoutId } = updatedList;

    return updateDoc(listRef, {
      ...updatedListWithoutId,
    });
  }

  deleteList(listId: string) {
    if (!this.currentUid)
      return console.error(
        'Could not delete list, because the user is not authenticated'
      );

    const listRef = doc(this.firestore, 'lists', listId);

    return deleteDoc(listRef);
  }

  addReminder(
    title: string,
    listId: string,
    description?: string,
    dueDate?: Timestamp
  ) {
    if (!this.currentUid)
      return console.error(
        'Could not add a new reminder, because the user is not authenticated'
      );

    const newReminder: Partial<Reminder> = {
      creationDate: Timestamp.fromDate(new Date()),
      title: title,
      completed: false,
      userId: this.currentUid,
      listId: listId,
    };

    if (description) newReminder.description = description;
    if (dueDate) newReminder.dueDate = dueDate;

    return addDoc(this.remindersCollection, newReminder);
  }

  editReminder(
    id: string,
    creationDate: Timestamp,
    title: string,
    completed: boolean,
    userId: string,
    listId: string,
    description?: string,
    dueDate?: Timestamp
  ) {
    if (!this.currentUid)
      return console.error(
        'Could not edit the reminder, because the user is not authenticated'
      );

    const reminderRef = doc(this.firestore, 'reminders', id);

    const updatedReminder: Partial<Reminder> = {
      creationDate,
      title,
      completed,
      userId,
      listId,
    };

    if (description) updatedReminder.description = description;
    if (dueDate) updatedReminder.dueDate = dueDate;

    return updateDoc(reminderRef, updatedReminder);
  }

  toggleReminderCompletion(reminder: Reminder) {
    if (!this.currentUid)
      return console.error(
        'Could not edit reminder, because the user is not authenticated'
      );

    const reminderRef = doc(this.firestore, 'reminders', reminder.id);

    reminder.completed = !reminder.completed;
    const { id, ...updatedReminderWithoutId } = reminder;

    return updateDoc(reminderRef, {
      ...updatedReminderWithoutId,
    });
  }

  deleteReminder(reminderId: string) {
    if (!this.currentUid)
      return console.error(
        'Could not delete reminder, because the user is not authenticated'
      );

    const reminderRef = doc(this.firestore, 'reminders', reminderId);

    return deleteDoc(reminderRef);
  }
}
