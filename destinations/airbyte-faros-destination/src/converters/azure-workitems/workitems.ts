import {emailAddress} from 'redact-pii/lib/built-ins/simple-regexp-patterns';

import {AirbyteRecord} from '../../../../../faros-airbyte-cdk/lib';
import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {AzureWorkitemsConverter} from './common';
import {CustomWorkItem, StatusValue} from './models';

interface StatusChange {
  readonly status: StatusValue;
  readonly changedAt: Date;
}

export class Workitems extends AzureWorkitemsConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_Task',
    'tms_TaskAssignment',
    // 'tms_TaskProjectRelationship',
  ];

  private statusChangelog(
    workItem: CustomWorkItem
  ): ReadonlyArray<StatusChange> {
    const statusChangelog: Array<StatusChange> = [];

    if (workItem && workItem?.fields?.custom) {
      for (const item of workItem.fields.custom) {
        if (
          item &&
          item.fields &&
          item.fields['System.State'] &&
          item.fields['System.State'].oldValue &&
          item.fields['System.ChangedDate'] &&
          this.isValidDate(item.fields['System.ChangedDate'].newValue)
        ) {
          statusChangelog.push({
            status: {
              newValue: item.fields['System.State'].newValue,
              oldValue: item.fields['System.State'].oldValue,
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
    ctx.logger.info(
      'Workitem ID:' +
        WorkItem?.id +
        ' =====> Organization extracted:' +
        JSON.stringify(organizationName)
    );
    const statusChangelog = this.statusChangelog(WorkItem);
    results.push({
      model: 'tms_Task',
      record: {
        uid: String(WorkItem?.id),
        url: WorkItem?.url,
        type: {
          category: String(WorkItem?.fields['System.WorkItemType']),
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
        status: {category: WorkItem?.fields['System.State']},
        statusChangedAt: WorkItem?.fields[
          'Microsoft.VSTS.Common.StateChangeDate'
        ]
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
      },
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
    // results.push({
    //   model: 'tms_TaskProjectRelationship',
    //   record: {
    //     task: { uid: `${organizationName}|${String(WorkItem?.id)}`, source,organization },
    //     project: { uid: `${organizationName}|${WorkItem?.fields?.["System.TeamProject"]}`, source },
    //   },
    // });
    return results;
  }
}
