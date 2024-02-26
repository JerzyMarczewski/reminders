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
import {
  Observable,
  iif,
  of,
  switchMap,
  map,
  from,
  catchError,
  throwError,
  BehaviorSubject,
} from 'rxjs';
import { Reminder } from './reminder.model';
import { List } from './list.model';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  currentUser$!: BehaviorSubject<User | null>;
  userLists$!: Observable<List[]>;
  userReminders$!: Observable<Reminder[]>;

  listsCollection!: CollectionReference;
  remindersCollection!: CollectionReference;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.currentUser$ = this.authService.getCurrentUser$();

    this.listsCollection = collection(this.firestore, 'lists');
    this.remindersCollection = collection(this.firestore, 'reminders');

    this.userLists$ = this.currentUser$.pipe(
      switchMap((user) =>
        user ? this.getUserListsData(user.uid) : of([] as List[])
      ),
      map(this.orderDataByCreationDate)
    );

    this.userReminders$ = this.currentUser$.pipe(
      switchMap((user) =>
        user ? this.getUserRemindersData(user.uid) : of([] as Reminder[])
      ),
      map(this.orderDataByCreationDate)
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

  private orderDataByCreationDate<T extends { creationDate: Timestamp }>(
    data: T[]
  ): T[] {
    return data.sort(
      (element1, element2) =>
        element1.creationDate.seconds - element2.creationDate.seconds
    );
  }

  addList(name: string, color: string, icon: string) {
    const user = this.currentUser$.getValue();

    if (!user)
      throw new Error(
        'Could not add a new list, because the user is not authenticated'
      );

    const newList: Partial<List> = {
      creationDate: Timestamp.fromDate(new Date()),
      name: name,
      color: color,
      icon: icon,
      userId: user.uid,
    };

    return from(addDoc(this.listsCollection, newList)).pipe(
      catchError((error) => {
        console.error('Error adding list:', error);
        throw error;
      })
    );
  }

  editList(updatedList: List) {
    const user = this.currentUser$.getValue();

    if (!user)
      throw new Error(
        'Could not edit list, because the user is not authenticated'
      );

    const listRef = doc(this.firestore, 'lists', updatedList.id);
    const { id, ...updatedListWithoutId } = updatedList;

    return from(
      updateDoc(listRef, {
        ...updatedListWithoutId,
      })
    ).pipe(
      catchError((error) => {
        console.error('Error editing list:', error);
        throw error;
      })
    );
  }

  deleteList(listId: string) {
    const user = this.currentUser$.getValue();

    if (!user)
      throw new Error(
        'Could not delete list, because the user is not authenticated'
      );

    const listRef = doc(this.firestore, 'lists', listId);

    return from(deleteDoc(listRef)).pipe(
      catchError((error) => {
        console.error('Error deleting list:', error);
        throw error;
      })
    );
  }

  addReminder(
    title: string,
    listId: string,
    description?: string,
    dueDate?: Timestamp
  ) {
    const user = this.currentUser$.getValue();

    if (!user)
      throw new Error(
        'Could not add a new reminder, because the user is not authenticated'
      );

    const newReminder: Partial<Reminder> = {
      creationDate: Timestamp.fromDate(new Date()),
      title: title,
      completed: false,
      userId: user.uid,
      listId: listId,
    };
    if (description) newReminder.description = description;
    if (dueDate) newReminder.dueDate = dueDate;

    return from(addDoc(this.remindersCollection, newReminder)).pipe(
      catchError((error) => {
        console.error('Error adding reminder:', error);
        throw error;
      })
    );
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
    const user = this.currentUser$.getValue();

    if (!user)
      throw new Error(
        'Could not add a new reminder, because the user is not authenticated'
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

    return from(updateDoc(reminderRef, updatedReminder)).pipe(
      catchError((error) => {
        console.error('Error editing reminder:', error);
        throw error;
      })
    );
  }

  toggleReminderCompletion(reminder: Reminder) {
    const user = this.currentUser$.getValue();

    if (!user)
      throw new Error(
        'Could not add a new reminder, because the user is not authenticated'
      );

    const reminderRef = doc(this.firestore, 'reminders', reminder.id);
    reminder.completed = !reminder.completed;
    const { id, ...updatedReminderWithoutId } = reminder;

    return from(
      updateDoc(reminderRef, {
        ...updatedReminderWithoutId,
      })
    ).pipe(
      catchError((error) => {
        console.error('Error toggling reminder completion:', error);
        throw error;
      })
    );
  }

  deleteReminder(reminderId: string) {
    const user = this.currentUser$.getValue();

    if (!user)
      throw new Error(
        'Could not delete reminder, because the user is not authenticated'
      );

    const reminderRef = doc(this.firestore, 'reminders', reminderId);
    return from(deleteDoc(reminderRef)).pipe(
      catchError((error) => {
        console.error('Error deleting reminder:', error);
        throw error;
      })
    );
  }
}
