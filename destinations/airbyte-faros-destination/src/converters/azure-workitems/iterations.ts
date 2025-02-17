import {camelCase, upperFirst} from 'lodash';

import {AirbyteRecord} from '../../../../../faros-airbyte-cdk/lib';
import {SprintState} from '../../../../../faros-airbyte-common/lib/common';
import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {AzureWorkitemsConverter} from './common';
import {Iteration} from './models';
export class Iterations extends AzureWorkitemsConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = ['tms_Sprint'];

  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const Iteration = record.record.data as Iteration;
    const source = this.streamName.source;
    const organizationName = this.getOrganizationFromUrl(Iteration?.url);
    ctx.logger.info('Organization found:' + organizationName);
    const organization = {uid: organizationName, source};
    ctx.logger.info(
      'Sprint State found: ' + JSON.stringify(Iteration.attributes.timeFrame)
    );
    const sprintState: SprintState = {
      category: upperFirst(camelCase(Iteration.attributes.timeFrame)),
      detail: '', // To added in the future, handled by Flowzyer common setter
    };
    return [
      {
        model: 'tms_Sprint',
        record: {
          uid: `${String(Iteration.id)}`,
          name: Iteration.name,
          state: sprintState,
          startedAt: Iteration.attributes.startDate,
          endedAt: Iteration.attributes.finishDate,
          organization,
          source,
        },
      },
    ];
  }
}
