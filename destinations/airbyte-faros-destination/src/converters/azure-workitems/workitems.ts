import {AirbyteRecord} from '../../../../../faros-airbyte-cdk/lib';
import {
  FlowzyerTask,
  TaskStatusChangeLog,
} from '../../../../../faros-airbyte-common/lib/common';
import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {AzureWorkitemsConverter} from './common';
import {CustomWorkItem} from './models';

export class Workitems extends AzureWorkitemsConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_Task',
    'tms_TaskAssignment',
    'tms_TaskProjectRelationship',
  ];

  private statusChangelog(
    workItem: CustomWorkItem
  ): Array<TaskStatusChangeLog> {
    const statusChangelog: Array<TaskStatusChangeLog> = [];

    if (workItem && workItem?.fields?.custom) {
      for (const item of workItem.fields.custom) {
        if (
          item &&
          item.fields &&
          item.fields['System.State'] &&
          item.fields['System.ChangedDate'] &&
          this.isValidDate(item.fields['System.ChangedDate'].newValue)
        ) {
          statusChangelog.push({
            status: {
              category: item.fields['System.State'].newValue,
              detail: item.fields['System.State'].newValue,
            },
            changedAt: item.fields['System.ChangedDate'].newValue,
          });
        }
      }
    }

    return statusChangelog;
  }
  private isValidDate(dateString: string): boolean {
    const timestamp = Date.parse(dateString);
    return !isNaN(timestamp);
  }

  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const source = this.streamName.source;
    const results: DestinationRecord[] = [];
    const WorkItem = record.record.data as CustomWorkItem;
    const organizationName = this.getOrganizationFromUrl(WorkItem?.url);
    const organization = {uid: organizationName, source};
    const statusChangelog = this.statusChangelog(WorkItem);
    const flowzyerTaskRecord: FlowzyerTask = {
      uid: String(WorkItem?.id),
      url: WorkItem?.url,
      type: {
        category: String(WorkItem?.fields['System.WorkItemType']),
        detail: '',
      },
      name: WorkItem?.fields['System.Title'],
      createdAt: new Date(WorkItem?.fields['System.CreatedDate']),
      parent: WorkItem?.fields['System.Parent']
        ? {
            uid: `${String(WorkItem?.fields['System.Parent'])}`,
            organization,
          }
        : null,
      description: WorkItem?.fields['System.Description'],
      status: {
        category: WorkItem?.fields['System.State'],
        detail: '',
      },
      statusChangedAt: WorkItem?.fields['Microsoft.VSTS.Common.StateChangeDate']
        ? new Date(WorkItem?.fields['Microsoft.VSTS.Common.StateChangeDate'])
        : null,
      statusChangelog: statusChangelog,
      updatedAt: WorkItem?.fields['Microsoft.VSTS.Common.StateChangeDate']
        ? new Date(WorkItem?.fields['Microsoft.VSTS.Common.StateChangeDate'])
        : null,
      creator: {
        uid: `${WorkItem?.fields['System.CreatedBy']['uniqueName']}`,
        organization,
      },
      sprint: {
        uid: `${String(WorkItem?.fields['System.IterationId'])}`,
        organization,
      },
      source,
      organization,
    };

    results.push({
      model: 'tms_Task',
      record: flowzyerTaskRecord,
    });
    results.push({
      model: 'tms_TaskAssignment',
      record: {
        task: {
          uid: `${String(WorkItem?.id)}`,
          organization,
        },
        assignee: {
          uid:
            `${WorkItem?.fields['System.CreatedBy']['uniqueName']}` ||
            `Unassigned`,
          organization,
        },
        source,
      },
    });
    results.push({
      model: 'tms_TaskProjectRelationship',
      record: {
        task: {uid: `${String(WorkItem?.id)}`, organization},
        project: {
          uid: `${WorkItem?.fields?.['System.TeamProject']}`,
          organization,
        },
      },
    });
    return results;
  }
}
