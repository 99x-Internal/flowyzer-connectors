import {AirbyteRecord} from 'faros-airbyte-cdk';
import {Board} from 'faros-airbyte-common/jira';
import {toString} from 'lodash';

import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {JiraConverter} from './common';
export class FarosBoards extends JiraConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_TaskBoard',
    'tms_TaskBoardProjectRelationship',
  ];

  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const board = record.record.data as Board;
    ctx.logger.info(
      'Board data received from destination: ' + JSON.stringify(board)
    );
    const uid = toString(board.id);
    if (!uid) return;
    const source = this.streamName.source;
    const organizationName = this.getOrganizationFromUrl(board.self);
    const organization = {uid: organizationName, source};
    ctx.logger.info(
      'Board data received from Destination:' + JSON.stringify(board)
    );
    const projectKey = board?.location?.projectKey;
    return [
      {
        model: 'tms_TaskBoard',
        record: {
          uid,
          name: board.name,
          type: board.type,
          organization,
          source,
          project: {uid: projectKey, organization},
        },
      },
      {
        model: 'tms_TaskBoardProjectRelationship',
        record: {
          board: {uid, source},
          project: {uid: toString(board.projectKey), source},
        },
      },
    ];
  }
}
