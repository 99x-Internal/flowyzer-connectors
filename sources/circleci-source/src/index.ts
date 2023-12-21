import {Command} from 'commander';
import {
  AirbyteConfiguredCatalog,
  AirbyteLogger,
  AirbyteSourceBase,
  AirbyteSourceRunner,
  AirbyteSpec,
  AirbyteState,
  AirbyteStreamBase,
} from 'faros-airbyte-cdk';
import VError from 'verror';

import {CircleCI, CircleCIConfig} from './circleci/circleci';
import {Faros} from './faros/faros';
import {Pipelines, Projects, Tests} from './streams';

/** The main entry point. */
export function mainCommand(): Command {
  const logger = new AirbyteLogger();
  const source = new CircleCISource(logger);
  return new AirbyteSourceRunner(logger, source).mainCommand();
}

/** CircleCI source implementation. */
export class CircleCISource extends AirbyteSourceBase<CircleCIConfig> {
  async spec(): Promise<AirbyteSpec> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return new AirbyteSpec(require('../resources/spec.json'));
  }

  async checkConnection(config: CircleCIConfig): Promise<[boolean, VError]> {
    try {
      const circleCI = CircleCI.instance(config, this.logger);
      await circleCI.checkConnection();
    } catch (err: any) {
      return [false, err];
    }
    return [true, undefined];
  }

  async onBeforeRead(
    config: CircleCIConfig,
    catalog: AirbyteConfiguredCatalog,
    state?: AirbyteState
  ): Promise<{
    config: CircleCIConfig;
    catalog: AirbyteConfiguredCatalog;
    state?: AirbyteState;
  }> {
    const circleCI = CircleCI.instance(config, this.logger);
    const projectSlugBlocklist = new Set(config.project_blocklist ?? []);

    let excludedRepoSlugs: string[] | undefined;
    if (config.pull_blocklist_from_graph) {
      const faros = new Faros(
        {
          url: config.faros_api_url,
          apiKey: config.faros_api_key,
        },
        this.logger
      );
      const excludedRepos = await faros.getExcludedRepos(
        config.faros_graph_name
      );
      excludedRepoSlugs = excludedRepos.map(
        (repo) =>
          `${repo.organization.source}/${repo.organization.uid}/${repo.name}`
      );
    }
    const excludedSlugs = new Set(excludedRepoSlugs ?? []);

    const allProjectSlugs: string[] = [];
    if (config.project_slugs.includes('*')) {
      const projects = await circleCI.getAllProjectSlugs();
      allProjectSlugs.push(...projects);
    } else {
      allProjectSlugs.push(...config.project_slugs);
    }

    config.project_slugs = allProjectSlugs.filter((slug) => {
      return !projectSlugBlocklist.has(slug) && !excludedSlugs.has(slug);
    });

    this.logger.debug(`Will sync project slugs: ${config.project_slugs}`);

    return {config, catalog, state};
  }

  streams(config: CircleCIConfig): AirbyteStreamBase[] {
    const circleCI = CircleCI.instance(config, this.logger);
    return [
      new Projects(circleCI, config, this.logger),
      new Pipelines(circleCI, config, this.logger),
      new Tests(circleCI, config, this.logger),
    ];
  }
}
