import {StreamKey, SyncMode} from 'faros-airbyte-cdk';
import {Sprint} from 'faros-airbyte-common/jira';
import {Utils} from 'faros-js-client';
import {toInteger, toString} from 'lodash';
import {Dictionary} from 'ts-essentials';

import {Jira} from '../jira';
import {BoardStreamSlice, StreamState, StreamWithBoardSlices} from './common';

export class FarosSprints extends StreamWithBoardSlices {
  getJsonSchema(): Dictionary<any, string> {
    return require('../../resources/schemas/farosSprints.json');
  }

  get primaryKey(): StreamKey | undefined {
    return 'id';
  }

  get cursorField(): string | string[] {
    return ['completeDate'];
  }

  async *readRecords(
    syncMode: SyncMode,
    cursorField?: string[],
    streamSlice?: BoardStreamSlice,
    streamState?: StreamState
  ): AsyncGenerator<Sprint> {
    const boardId = streamSlice.board;
    const jira = await Jira.instance(this.config, this.logger);
    const board = await jira.getBoard(boardId);
    this.logger.info('New - Board found: ' + JSON.stringify(board));
    // if (board.type !== 'scrum') return;
    const updateRange =
      syncMode === SyncMode.INCREMENTAL
        ? this.getUpdateRange(streamState[boardId]?.cutoff)
        : this.getUpdateRange();

    try {
      for (const sprint of await jira.getSprints(boardId, updateRange)) {
        if (sprint != null) {
          this.logger.info('Sprint record found: ' + JSON.stringify(sprint));
          yield {
            id: sprint.id,
            originBoardId: sprint.originBoardId,
            name: sprint.name,
            state: sprint.state,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            completeDate: sprint.completeDate,
            activatedDate: sprint['activatedDate'],
            boardId: toInteger(boardId),
            self: sprint.self,
          };
        }
      }
    } catch (err: any) {
      this.logger.error(
        `Error,${err.toString()}} found when reading the sprint from this board id:${boardId}`
      );
    }
  }

  getUpdatedState(
    currentStreamState: StreamState,
    latestRecord: Sprint
  ): StreamState {
    const board = toString(latestRecord.boardId);
    const latestRecordCutoff = Utils.toDate(latestRecord.completeDate);
    return this.getUpdatedStreamState(
      latestRecordCutoff,
      currentStreamState,
      board
    );
  }
}
