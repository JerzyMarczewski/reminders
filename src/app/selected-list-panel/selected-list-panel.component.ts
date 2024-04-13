import { Component } from '@angular/core';
import { List } from '../list.model';
import { Reminder } from '../reminder.model';
import { DialogService } from '../dialog.service';
import { FirestoreService } from '../firestore.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { WindowSizeService } from '../window-size.service';
import { BehaviorSubject, Observable, combineLatest, map, take } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-selected-list-panel',
  templateUrl: './selected-list-panel.component.html',
  styleUrl: './selected-list-panel.component.scss',
  animations: [
    trigger('openClose', [
      state('void', style({ transform: 'translateX(0)' })),
      state('open', style({ transform: 'translateX(-100%)' })),
      state('closed', style({ transform: 'translateX(0)' })),
      transition('* => *', [animate('0.5s ease-in-out')]),
    ]),
  ],
})
export class SelectedListPanelComponent {
  selectedList$!: Observable<List | null>;
  reminders$!: Observable<Reminder[] | null>;
  filteredReminders$!: Observable<Reminder[] | null>;
  animationState!: 'void' | 'open' | 'closed';
  private completedRemindersShownSubject = new BehaviorSubject<boolean>(false);
  completedRemindersShown$ = this.completedRemindersShownSubject.asObservable();

  constructor(
    private dialogService: DialogService,
    private firestoreService: FirestoreService,
    private windowSizeService: WindowSizeService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.selectedList$ = this.appService.selectedList$;
    this.reminders$ = this.firestoreService.userReminders$;

    this.filteredReminders$ = combineLatest([
      this.selectedList$,
      this.reminders$,
      this.completedRemindersShown$,
    ]).pipe(
      map(([selectedList, reminders, completedRemindersShown]) => {
        if (!selectedList || !reminders) return null;

        const selectedListReminders = reminders.filter(
          (reminder) => reminder.listId === selectedList.id
        );

        if (!completedRemindersShown)
          return selectedListReminders
            .filter((reminder) => !reminder.completed)
            .sort(this.sortRemindersByDueDate);

        return selectedListReminders
          .sort(this.sortRemindersByDueDate)
          .sort(this.sortRemindersByCompletionStatus);
      })
    );

    this.windowSizeService.windowWidth$.subscribe((width) => {
      this.changeOpenCloseAnimationState(width);
    });

    this.selectedList$.subscribe((list) => {
      const width = window.innerWidth;
      this.changeOpenCloseAnimationState(width);
    });
  }

  private changeOpenCloseAnimationState(width: number) {
    if (width < 1024) {
      this.animationState = this.appService.getSelectedList()
        ? 'open'
        : 'closed';
    } else {
      this.animationState = 'void';
    }
  }

  private sortRemindersByCompletionStatus(
    reminder1: Reminder,
    reminder2: Reminder
  ) {
    return Number(reminder1.completed) - Number(reminder2.completed);
  }

  private sortRemindersByDueDate(reminder1: Reminder, reminder2: Reminder) {
    if (!reminder1.dueDate && !reminder2.dueDate) return 0;

    if (!reminder1.dueDate) return 1;

    if (!reminder2.dueDate) return -1;

    return reminder1.dueDate.seconds - reminder2.dueDate.seconds;
  }

  handleBackArrowClick(): void {
    this.appService.setSelectedList(null);
  }

  handleEditListInfoClick() {
    const list = this.appService.getSelectedList();

    if (list) this.dialogService.openEditListDialog(list);
  }

  hanleEditReminderInfoClick(reminder: Reminder) {
    this.dialogService.openEditReminderDialog(reminder);
  }

  handleShowCompletedToggle(): void {
    this.completedRemindersShownSubject.next(
      !this.completedRemindersShownSubject.getValue()
    );
  }

  handleDeleteClick(): void {
    const list = this.appService.getSelectedList();
    if (list) {
      this.dialogService
        .openConfirmationDialog('Are you sure you want to delete this list?')
        .pipe(take(1))
        .subscribe((result) => {
          if (result) this.firestoreService.deleteList(list.id);
        });
    }
  }
}
