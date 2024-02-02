import { Timestamp } from '@angular/fire/firestore';
export interface List {
  id: string;
  creationDate: Timestamp;
  name: string;
  color: string;
  icon: string;
  userId: string;
}
