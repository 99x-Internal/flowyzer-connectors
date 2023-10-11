import {Command} from 'commander';
import {
  AirbyteConfig,
  AirbyteLogger,
  AirbyteSourceBase,
  AirbyteSourceRunner,
  AirbyteSpec,
  AirbyteStreamBase,
} from 'faros-airbyte-cdk';
import {FarosClient} from 'faros-js-client';
import VError from 'verror';

import {OrgTeamParentNulls} from './streams/org-team-parent-null';

export interface GraphQLConfig extends AirbyteConfig {
  api_key: string;
  api_url: string;
  graph: string;
}

export function mainCommand(): Command {
  const logger = new AirbyteLogger();
  const source = new FarosGraphDoctorSource(logger);
  return new AirbyteSourceRunner(logger, source).mainCommand();
}

const DEFAULT_API_URL = 'https://prod.api.faros.ai';

export class FarosGraphDoctorSource extends AirbyteSourceBase<GraphQLConfig> {
  async spec(): Promise<AirbyteSpec> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return new AirbyteSpec(require('../resources/spec.json'));
  }

  async checkConnection(config: GraphQLConfig): Promise<[boolean, VError]> {
    try {
      const faros = this.makeFarosClient(config);

      if (!(await faros.graphExists(config.graph))) {
        return [false, new VError(`Graph ${config.graph} does not exist!`)];
      }
    } catch (err: any) {
      return [false, err as VError];
    }

    return [true, undefined];
  }

  streams(config: GraphQLConfig): AirbyteStreamBase[] {
    return [
      new OrgTeamParentNulls(config, this.logger, this.makeFarosClient(config)),
    ];
  }

  validateConfig(config: GraphQLConfig): void {
    if (!config.api_key) throw new VError('Faros API key was not provided');
    if (!config.graph) throw new VError('Faros graph name was not provided');
  }

  makeFarosClient(config: GraphQLConfig): FarosClient {
    this.validateConfig(config);

    const faros = new FarosClient({
      url: config.api_url ?? DEFAULT_API_URL,
      apiKey: config.api_key,
      useGraphQLV2: true,
    });

    return faros;
  }
}
