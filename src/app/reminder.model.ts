export interface Reminder {
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  userId: string;
  listId: string;
}
