import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { JellyfinApi } from '../lib/jellyfinApi';
import {
  JellyfinInfoResponse,
  JellyfinItemsResponse,
  JellyfinUserDataResponse,
  JellyfinUserResponse
} from './interfaces/server.interfaces';

@Injectable()
export class JellyfinApiService {
  private api: JellyfinApi;
  private readonly logger = new Logger(JellyfinApiService.name);

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {
    this.init();
  }

  public async init() {
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

  public async getMediaId(title: string) {
    try {
      const response: JellyfinItemsResponse = await this.api.get(`/Items?recursive=true&searchTerm=${title}`);
      if (response.Items.length > 0) {
        return response.Items[0].Id;
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

  public async getUsersIds() {
    try {
      const response: JellyfinUserResponse = await this.api.get('/Users');
      if (response.length > 0) {
        return response.map((user) => user.Id);
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

  public async getLastSeen(title: string) {
    try {
      const mediaId = await this.getMediaId(title);
      if (!mediaId) {
        return null;
      }
  
      let lastSeen = null;
      const usersIds = await this.getUsersIds();
      
      // Create an array of promises to fetch the user data in parallel
      const userPromises = usersIds.map(async (userId) => {
        const response: JellyfinUserDataResponse = await this.api.get(`/UserItems/${mediaId}/UserData?userId=${userId}`);
        if (response && response.Played) {
          const userSeen = new Date(response.LastPlayedDate);
          if (!lastSeen || userSeen > lastSeen) {
            lastSeen = userSeen;
          }
        }
      });
  
      // Wait for all the promises to complete
      await Promise.all(userPromises);
      return lastSeen;
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
      const mediaId = await this.getMediaId(title);
      if (!mediaId) {
        return null;
      }

      let playCount = 0;
      const usersIds = await this.getUsersIds();

      // Create an array of promises to fetch the user data in parallel
      const userPromises = usersIds.map(async (userId) => {
        const response: JellyfinUserDataResponse = await this.api.get(`/UserItems/${mediaId}/UserData?userId=${userId}`)
        if (response && response.Played) {
          playCount += response.PlayCount;
        }
      });

      // Wait for all the promises to complete
      await Promise.all(userPromises);
      return playCount;
    } catch (err) {
      this.logger.warn(
        'Jellyfin api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }
}
