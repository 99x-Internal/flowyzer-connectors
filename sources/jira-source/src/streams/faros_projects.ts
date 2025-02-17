import {StreamKey, SyncMode} from 'faros-airbyte-cdk';
import {Version2Models} from 'jira.js';
import {toUpper} from 'lodash';
import {Dictionary} from 'ts-essentials';

import {Jira} from '../jira';
import {StreamBase} from './common';

export class FarosProjects extends StreamBase {
  getJsonSchema(): Dictionary<any, string> {
    return require('../../resources/schemas/farosProjects.json');
  }

  get primaryKey(): StreamKey | undefined {
    return 'key';
  }

  async *readRecords(
    syncMode: SyncMode,
    cursorField?: string[],
    streamSlice?: Dictionary<any>,
    streamState?: Dictionary<any>
  ): AsyncGenerator<Version2Models.Project> {
    const jira = await Jira.instance(this.config, this.logger);
    const projectKeys = this.config.projects?.length
      ? new Set(this.config.projects.map((key) => toUpper(key)))
      : undefined;
    for (const project of await jira.getProjects(projectKeys)) {
      this.logger.info('Project found from Source: ' + JSON.stringify(project));
      yield project;
    }
  }
}
