export class TaskStatus {
  category: string;
  detail: string;
}
export class TaskStatusChangeLog {
  status: TaskStatus;
  changedAt: Date;
}

export function CreateTaskStatusChangeLog(): TaskStatusChangeLog {
  return;
}
