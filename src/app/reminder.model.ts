import { Timestamp } from '@angular/fire/firestore';

export interface Reminder {
  id: string;
  creationDate: Timestamp;
  title: string;
  description?: string;
  dueDate?: Timestamp;
  completed: boolean;
  userId: string;
  listId: string;
}
