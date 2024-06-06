import {AirbyteRecord} from 'faros-airbyte-cdk';
import {Utils} from 'faros-js-client';
import {toString} from 'lodash';

import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {JiraConverter} from './common';

export class FarosProjects extends JiraConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = ['tms_Project'];

  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const project = record.record.data;
    ctx.logger.info('Project Found :' + JSON.stringify(project));
    const source = this.streamName.source;
    return [
      {
        model: 'tms_Project',
        record: {
          uid: toString(project.key),
          name: project.name,
          description: Utils.cleanAndTruncate(
            project.description,
            this.truncateLimit(ctx)
          ),
          sourceSystemId: project.id,
          source,
        },
      },
    ];
  }
}
