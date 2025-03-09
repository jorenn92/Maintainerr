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
  private readonly logger = new Logger(this.settings.jellyfin_url);

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
          "Plex API isn't fully initialized, required settings aren't set",
        );
      }
    } catch (err) {
      this.logger.warn(`Couldn't connect to Plex.. Please check your settings`);
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
        "SELECT DISTINCT IFNULL(NULLIF(SUBSTR(ItemName, 0, INSTR(ItemName, ' - ')), ''), ItemName) ItemName, strftime('%s', strftime('%s', DateCreated), 'unixepoch') lastView FROM PlaybackActivity WHERE SUBSTR(ItemName, 0, INSTR(ItemName, ' - ')) != '' GROUP BY IFNULL(NULLIF(SUBSTR(ItemName, 0, INSTR(ItemName, ' - ')), ''), ItemName) ORDER BY DateCreated DESC",
      );
      const lastSeen = +response.results.find((el) => el[0] == title)[1];
      return new Date(lastSeen * 1000);
    } catch (err) {
      this.logger.warn(
        'Jellyfin api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }
}
