import {AirbyteRecord} from '../../../../../faros-airbyte-cdk/lib';
import {DestinationModel, DestinationRecord} from '../converter';
import {AzureWorkitemsConverter} from './common';
import {Board} from './models';

export class Boards extends AzureWorkitemsConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_TaskBoard',
    'tms_Project',
  ];

  async convert(
    record: AirbyteRecord
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const source = this.streamName.source;
    const board = record.record.data as Board;
    const organizationName = this.getOrganizationFromUrl(board.url);
    const organization = {uid: organizationName, source};
    const results = [];

    results.push({
      model: 'tms_Project',
      record: {
        uid: String(board.id),
        name: board.name,
        source,
        organization,
      },
    });

    results.push({
      model: 'tms_TaskBoard',
      record: {
        uid: String(board.id),
        name: board.name,
        organization,
        source,
      },
    });

    return results;
  }
}
