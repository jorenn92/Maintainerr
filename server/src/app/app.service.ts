import { Injectable, Logger } from '@nestjs/common';
import { ExternalApiService } from '../modules/api/external-api/external-api.service';
import { type VersionResponse } from '@maintainerr/contracts';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly externalApi: ExternalApiService) {}

  async getAppVersionStatus(): Promise<VersionResponse> {
    try {
      const packageVersion = process.env.npm_package_version
        ? process.env.npm_package_version
        : '0.0.1';

      const versionTag = process.env.VERSION_TAG
        ? process.env.VERSION_TAG
        : 'develop';

      const calculatedVersion =
        versionTag !== 'stable'
          ? process.env.GIT_SHA
            ? `${versionTag}-${process.env.GIT_SHA.substring(0, 7)}`
            : `${versionTag}-`
          : `${packageVersion}`;

      const local = process.env.NODE_ENV !== 'production';

      return {
        status: 1,
        version: calculatedVersion,
        commitTag: `${local ? 'local' : ''}`,
        updateAvailable: await this.isUpdateAvailable(
          packageVersion,
          versionTag,
        ),
      };
    } catch (err) {
      this.logger.error(`Couldn't fetch app version status`);
      this.logger.debug(err);
      return {
        status: 0,
        version: '0.0.1',
        commitTag: '',
        updateAvailable: false,
      };
    }
  }

  private async isUpdateAvailable(currentVersion: string, versionTag: string) {
    if (versionTag === 'stable') {
      const githubResp: { tag_name: string } = await this.externalApi.get(
        'https://api.github.com/repos/jorenn92/maintainerr/releases/latest',
        {},
        7200, // cache this for 2 hours
      );
      if (githubResp && githubResp.tag_name) {
        const transformedLocalVersion = currentVersion
          .replace('v', '')
          .replace('.', '');

        const transformedGithubVersion = githubResp.tag_name
          .replace('v', '')
          .replace('.', '');

        return transformedGithubVersion > transformedLocalVersion;
      }
      this.logger.warn(`Couldn't fetch latest release version from GitHub`);
      return false;
    } else {
      // in case of develop, compare SHA's
      if (process.env.GIT_SHA) {
        const githubResp: { sha: string } = await this.externalApi.get(
          'https://api.github.com/repos/jorenn92/maintainerr/commits/main',
          {},
          7200, // cache this for 2 hours
        );
        if (githubResp && githubResp.sha) {
          return githubResp.sha !== process.env.GIT_SHA;
        }
      }
    }
    return false;
  }
}
