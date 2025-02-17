import {Utils} from 'faros-js-client';
import {camelCase, upperFirst} from 'lodash';

import {AirbyteRecord} from '../../../../../faros-airbyte-cdk/lib';
import {SprintState} from '../../../../../faros-airbyte-common/lib/common';
import {Sprint} from '../../../../../faros-airbyte-common/lib/jira';
import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {JiraConverter} from './common';

export class FarosSprints extends JiraConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_Sprint',
    // 'tms_SprintBoardRelationship', // Sprint board does not exist in Faros schema at the moment
  ];
  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const sprint = record.record.data as Sprint;
    const source = this.streamName.source;
    const organizationName = this.getOrganizationFromUrl(sprint?.self);
    const organization = {uid: organizationName, source};
    ctx.logger.info(`Sprint data found: ${JSON.stringify(sprint)}`);
    const sprintState: SprintState = {
      category: upperFirst(camelCase(sprint.state)),
      detail: '',
    };
    return [
      {
        model: 'tms_Sprint',
        record: {
          uid: `${sprint.id}`,
          name: sprint.name,
          state: sprintState,
          startedAt: Utils.toDate(sprint.startDate),
          openedAt: Utils.toDate(sprint.activatedDate),
          endedAt: Utils.toDate(sprint.endDate),
          closedAt: Utils.toDate(sprint.completeDate),
          source,
          organization,
        },
      },
      // {
      //   model: 'tms_SprintBoardRelationship',
      //   record: {
      //     sprint: {uid, source},
      //     board: {uid: toString(sprint.boardId), source},
      //   },
      // },
    ];
  }
}
