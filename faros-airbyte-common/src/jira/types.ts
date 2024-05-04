import {AgileModels} from 'jira.js/out/agile';
import {Version2Models} from 'jira.js/out/version2';

export interface IssueCompact {
  readonly id?: string;
  readonly key: string;
  readonly fields?: any;
  readonly created?: Date;
  readonly updated?: Date;
  readonly boardId?: string;
}

export interface Issue extends IssueCompact {
  readonly type: string;
  readonly status: Status;
  readonly creator: string;
  readonly project: string;
  readonly priority: string;
  readonly labels: ReadonlyArray<string>;
  readonly dependencies: ReadonlyArray<Dependency>;
  readonly subtasks: ReadonlyArray<string>;
  readonly parent?: Parent;
  readonly statusChanged?: Date;
  readonly statusChangelog: ReadonlyArray<[Status, Date]>;
  readonly keyChangelog: ReadonlyArray<[string, Date]>;
  readonly summary?: string;
  readonly description?: string;
  readonly assignees?: ReadonlyArray<Assignee>;
  readonly assigned?: Date;
  readonly points?: number;
  readonly epic?: string;
  readonly sprintInfo?: SprintInfo;
  readonly additionalFields: ReadonlyArray<[string, string]>;
  readonly url: string;
  readonly resolution: string;
  readonly resolutionDate: Date;
}

export interface Parent {
  key: string;
  type?: string;
}

export interface Dependency {
  readonly key: string;
  readonly inward: string;
  readonly outward: string;
}

export interface Status {
  readonly category: string;
  readonly detail: string;
}

export interface Assignee {
  readonly uid: string;
  readonly assignedAt: Date;
}

export interface SprintHistory {
  readonly uid: string;
  readonly addedAt: Date;
  readonly removedAt?: Date;
}

export interface SprintInfo {
  readonly currentSprintId: string;
  readonly history: ReadonlyArray<SprintHistory>;
}

export enum RepoSource {
  BITBUCKET = 'Bitbucket',
  GITHUB = 'GitHub',
  GIT_FOR_JIRA_CLOUD = 'GitForJiraCloud',
  GITLAB = 'GitLab',
  VCS = 'VCS',
  AZURE = 'AZURE-REPOS',
}

export interface Repo {
  readonly source: RepoSource;
  readonly org: string;
  readonly name: string;
}

export interface PullRequestIssue {
  readonly key: string;
  readonly updated: Date;
  readonly project: string;
}

export interface PullRequest {
  readonly repo: Repo;
  readonly number: number;
  readonly issue?: PullRequestIssue;
}

export interface PullRequest {
  readonly repo: Repo;
  readonly number: number;
  readonly issue?: PullRequestIssue;
  repoUrl: string;
  title: string;
  state: PullRequestState;
  origin: string;
  mergedAt: string;
  author: {uid: string; source: string};
}

export interface PullRequestState {
  category: PullRequestStateCategory;
  detail: string;
}

export enum PullRequestStateCategory {
  Closed = 'Closed',
  Merged = 'Merged',
  Open = 'Open',
  Custom = 'Custom',
}

export interface Sprint extends AgileModels.Sprint {
  // The date the sprint is opened in Jira Server
  readonly activatedDate?: string;
}

export interface SprintReport {
  readonly id: number;
  readonly boardId?: string;
  readonly closedAt?: Date;
  readonly completedPoints?: number;
  readonly completedInAnotherSprintPoints?: number;
  readonly notCompletedPoints?: number;
  readonly puntedPoints?: number;
  readonly plannedPoints?: number;
  readonly issues: SprintIssue[];
}

export interface SprintIssue {
  readonly key: string;
  readonly points: number;
  readonly status: string;
  readonly addedDuringSprint?: boolean;
}

export interface IssueField {
  readonly id: string;
  readonly name: string;
  readonly value?: string;
}

export interface User extends Version2Models.User {
  id: string;
}
