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
  writeBatch,
} from '@angular/fire/firestore';
import {
  Observable,
  of,
  switchMap,
  map,
  from,
  catchError,
  BehaviorSubject,
} from 'rxjs';
import { Reminder } from './reminder.model';
import { List } from './list.model';
import { AuthService } from './auth.service';
import {
  Auth,
  User,
  deleteUser,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  currentUser$!: BehaviorSubject<User | null>;
  userLists$!: Observable<List[]>;
  userReminders$!: Observable<Reminder[]>;

  listsCollection!: CollectionReference;
  remindersCollection!: CollectionReference;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private auth: Auth
  ) {
    this.currentUser$ = this.authService.currentUser$;

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

  private getUserListsData(uid: string): Observable<List[]> {
    const userListsQuery = query(
      this.listsCollection,
      where('userId', '==', uid)
    );

    return collectionData(userListsQuery, {
      idField: 'id',
    }) as Observable<List[]>;
  }

  private getUserRemindersData(uid: string): Observable<Reminder[]> {
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

  getNumberOfUncompletedReminders$(list: List): Observable<number> {
    return this.userReminders$.pipe(
      map(
        (reminders) =>
          reminders.filter(
            (reminder) => reminder.listId === list.id && !reminder.completed
          ).length
      )
    );
  }

  addList(name: string, color: string, icon: string): void {
    const user = this.currentUser$.getValue();

    if (!user) return;

    const newList: Partial<List> = {
      creationDate: Timestamp.fromDate(new Date()),
      name: name,
      color: color,
      icon: icon,
      userId: user.uid,
    };

    addDoc(this.listsCollection, newList).catch((error) =>
      this.snackbarService.displayFirebaseError(
        error,
        'Error while adding list.'
      )
    );
  }

  editList(updatedList: List): void {
    const user = this.currentUser$.getValue();

    if (!user) return;

    const listRef = doc(this.firestore, 'lists', updatedList.id);
    const { id, ...updatedListWithoutId } = updatedList;

    updateDoc(listRef, {
      ...updatedListWithoutId,
    }).catch((error) => {
      this.snackbarService.displayFirebaseError(error, 'Error editing list.');
    });
  }

  deleteList(listId: string): void {
    const user = this.currentUser$.getValue();

    if (!user) return;

    const listRef = doc(this.firestore, 'lists', listId);

    deleteDoc(listRef).catch((error) => {
      this.snackbarService.displayFirebaseError(error, 'Error deleting list.');
    });
  }

  addReminder(
    title: string,
    listId: string,
    description?: string,
    dueDate?: Timestamp
  ): void {
    const user = this.currentUser$.getValue();

    if (!user) return;

    const newReminder: Partial<Reminder> = {
      creationDate: Timestamp.fromDate(new Date()),
      title: title,
      completed: false,
      userId: user.uid,
      listId: listId,
    };
    if (description) newReminder.description = description;
    if (dueDate) newReminder.dueDate = dueDate;

    addDoc(this.remindersCollection, newReminder).catch((error) => {
      this.snackbarService.displayFirebaseError(
        error,
        'Error adding reminder.'
      );
    });
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
  ): void {
    const user = this.currentUser$.getValue();

    if (!user) return;

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

    updateDoc(reminderRef, updatedReminder).catch((error) => {
      this.snackbarService.displayFirebaseError(
        error,
        'Error editing reminder:.'
      );
    });
  }

  toggleReminderCompletion(reminder: Reminder): void {
    const user = this.currentUser$.getValue();

    if (!user) return;

    const reminderRef = doc(this.firestore, 'reminders', reminder.id);
    reminder.completed = !reminder.completed;
    const { id, ...updatedReminderWithoutId } = reminder;

    updateDoc(reminderRef, {
      ...updatedReminderWithoutId,
    }).catch((error) => {
      this.snackbarService.displayFirebaseError(
        error,
        'Error toggling reminder completion status.'
      );
    });
  }

  deleteReminder(reminderId: string): void {
    const user = this.currentUser$.getValue();

    if (!user) return;

    const reminderRef = doc(this.firestore, 'reminders', reminderId);
    deleteDoc(reminderRef).catch((error) => {
      this.snackbarService.displayFirebaseError(
        error,
        'Error deleting reminder.'
      );
    });
  }

  private removeAllListsOfUser() {
    return new Promise<void>((resolve, reject) => {
      this.userLists$.subscribe((lists) => {
        const batch = writeBatch(this.firestore);

        lists.forEach((list) => {
          const listRef = doc(this.firestore, 'lists', list.id);
          batch.delete(listRef);
        });

        batch
          .commit()
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  private removeAllRemindersOfUser() {
    return new Promise<void>((resolve, reject) => {
      this.userReminders$.subscribe((reminders) => {
        const batch = writeBatch(this.firestore);

        reminders.forEach((reminder) => {
          const reminderRef = doc(this.firestore, 'reminders', reminder.id);
          batch.delete(reminderRef);
        });

        batch
          .commit()
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  private removeAllUserData(): Promise<[void, void]> {
    const promise1 = this.removeAllListsOfUser();
    const promise2 = this.removeAllRemindersOfUser();

    return Promise.all([promise1, promise2]);
  }

  deleteUserAndAllData(email: string, password: string): void {
    const user = this.currentUser$.getValue();
    if (!user) {
      return;
    }

    signInWithEmailAndPassword(this.auth, email, password)
      .then(() => this.removeAllUserData())
      .then(() => deleteUser(user))
      .then(() => {
        this.snackbarService.showMessage('Account deleted successfully');
      })
      .catch((error) => {
        console.error(error);
        this.snackbarService.displayFirebaseError(error);
      });
  }
}
