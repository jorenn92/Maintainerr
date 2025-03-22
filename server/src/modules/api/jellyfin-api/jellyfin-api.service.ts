import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { JellyfinApi } from '../lib/jellyfinApi';
import {
  JellyfinInfoResponse,
  JellyfinUsageResponse,
} from './interfaces/server.interfaces';

@Injectable()
export class JellyfinApiService {
  private api: JellyfinApi;
  private readonly logger = new Logger(JellyfinApiService.name);

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {
    this.initialize();
  }

  public async initialize() {
    try {
      const url = this.settings.jellyfin_url;
      const apiKey = this.settings.jellyfin_api_key;
      if (url && apiKey) {
        this.api = new JellyfinApi({ url, apiKey });
      } else {
        this.logger.log(
          "Jellyfin API isn't fully initialized, required settings aren't set",
        );
      }
    } catch (err) {
      this.logger.warn(
        `Couldn't connect to Jellyfin.. Please check your settings`,
      );
      this.logger.debug(err);
    }
  }

  public async getStatus() {
    try {
      const response: JellyfinInfoResponse = await this.api.get('/System/Info');
      return response;
    } catch (err) {
      this.logger.warn(
        'Jellyfin api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getLastSeen(title: string) {
    try {
      const response: JellyfinUsageResponse = await this.api.post(
        '/user_usage_stats/submit_custom_query',
        {
          CustomQueryString: `SELECT DISTINCT ItemName, max(strftime('%s', strftime('%s', DateCreated), 'unixepoch')) lastView FROM PlaybackActivity WHERE ItemName = '${title}' GROUP BY ItemName ORDER BY DateCreated DESC`,
        },
      );
      const result = response.results.find((el) => el[0] == title);
      if (result) {
        const lastSeen = +result[1];
        return new Date(lastSeen * 1000);
      }
      return null;
    } catch (err) {
      this.logger.warn(
        'Jellyfin api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getTimesViewed(title: string) {
    try {
      const response: JellyfinUsageResponse = await this.api.post(
        '/user_usage_stats/submit_custom_query',
        {
          CustomQueryString: `SELECT COUNT(0) FROM PlaybackActivity WHERE ItemName = '${title}'`,
        },
      );
      const result = response.results.find((el) => el[0] == title);
      if (result) {
        return +result[0];
      }
      return 0;
    } catch (err) {
      this.logger.warn(
        'Jellyfin api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }
}
