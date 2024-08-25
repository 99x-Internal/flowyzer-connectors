import {toLower} from 'lodash';

import {AirbyteRecord} from '../../../../../faros-airbyte-cdk/lib';
import {PullRequest} from '../../../../../faros-airbyte-common/lib/jira';
import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {JiraConverter} from './common';

export class FarosIssuePullRequests extends JiraConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'tms_TaskPullRequestAssociation',
  ];

  protected getRepoNameFromPullRequestUrl(
    url?: string,
    source?: string
  ): string {
    if (url) {
      if (toLower(source).indexOf('azure') > -1) {
        return url.split('/')[5];
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const pullRequest = record.record.data as PullRequest;
    const source = this.streamName.source;
    const organizationName = this.getOrganizationFromUrl(
      pullRequest.organization
    );
    const repoName = this.getRepoNameFromPullRequestUrl(
      pullRequest.repo.name,
      pullRequest.repo.source
    );
    const organization = {uid: organizationName, source};
    return [
      {
        model: 'tms_TaskPullRequestAssociation',
        record: {
          task: {
            uid: `${pullRequest.issue.key}`,
            source,
            organization,
          },
          pullRequest: {
            uid: `${pullRequest.issue.key}`,
            repository: {
              uid: repoName,
              organization,
              name: toLower(pullRequest.repo.name),
            },
            number: pullRequest.number,
            origin: 'jira',
          },
        },
      },
    ];
  }
}
