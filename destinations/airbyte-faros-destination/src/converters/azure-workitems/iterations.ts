import {AirbyteRecord} from '../../../../../faros-airbyte-cdk/lib';
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
    ctx.logger.info('Sprint UID found: ' + Iteration.id);
    return [
      {
        model: 'tms_Sprint',
        record: {
          uid: `${String(Iteration.id)}`,
          name: Iteration.name,
          state: Iteration.attributes.timeFrame,
          startedAt: Iteration.attributes.startDate,
          endedAt: Iteration.attributes.finishDate,
          organization,
          source,
        },
      },
    ];
  }
}
