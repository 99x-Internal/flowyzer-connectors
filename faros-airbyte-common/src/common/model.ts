export class TaskStatus {
  category: string;
  detail: string;
}
export class TaskStatusChangeLog {
  status: TaskStatus;
  changedAt: Date;
}

export class TaskType {
  category: string;
  detail: string;
}
export class TaskAdditionalField {
  name: string;
  value: string;
}

export class FlowzyerOrganization {
  uid: string;
  source: string;
}
export class FlowzyerTask {
  uid: string;
  status: TaskStatus;
  statusChangelog: TaskStatusChangeLog[];
  type: TaskType;
  additionalFields?: TaskAdditionalField[];
  organization: FlowzyerOrganization;
  url?: string;
  name?: string;
  createdAt?: Date;
  parent?: any;
  description?: string;
  statusChangedAt: Date;
  creator?: any;
  sprint?: any;
  source?: any;
  updatedAt?: Date;
  priority?: string;
  points?: number;
  epic?: any;
  resolutionStatus?: string;
  resolvedAt?: Date;
  sourceSystemId?: string;
  project?: any;
}

export class SprintState {
  category: string;
  detail: string;
}
