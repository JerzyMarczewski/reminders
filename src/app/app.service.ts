import { Injectable } from '@angular/core';
import { List } from './list.model';
import { BehaviorSubject, Observable, map, share, withLatestFrom } from 'rxjs';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private avatarsLoadingSubject = new BehaviorSubject<boolean>(true);
  avatarsLoading$: Observable<boolean> =
    this.avatarsLoadingSubject.asObservable();

  private selectedListSubject = new BehaviorSubject<List | null>(null);
  selectedList$ = this.selectedListSubject.asObservable();

  constructor(private firestoreService: FirestoreService) {
    this.firestoreService.userLists$
      .pipe(
        withLatestFrom(this.selectedList$),
        map(([userLists, selectedList]) => {
          const newList = userLists.find(
            (list) => list.id === selectedList?.id
          );
          return newList || null;
        })
      )
      .subscribe((updatedList) => {
        this.selectedListSubject.next(updatedList);
      });
  }

  setAvatarsLoading(loading: boolean): void {
    this.avatarsLoadingSubject.next(loading);
  }

  setSelectedList(list: List | null): void {
    this.selectedListSubject.next(list);
  }

  getSelectedList(): List | null {
    return this.selectedListSubject.getValue();
  }
}
