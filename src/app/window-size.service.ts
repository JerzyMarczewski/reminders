import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WindowSizeService {
  private windowWidthSubject: BehaviorSubject<number>;
  public windowWidth$: Observable<number>;

  constructor() {
    this.windowWidthSubject = new BehaviorSubject<number>(window.innerWidth);
    this.windowWidth$ = this.windowWidthSubject.asObservable();

    window.addEventListener('resize', () => {
      this.windowWidthSubject.next(window.innerWidth);
    });
  }
}
