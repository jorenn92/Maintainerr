import { Injectable, Logger } from '@nestjs/common';
import { JellyfinApiService } from '../../api/jellyfin-api/jellyfin-api.service';
import { PlexLibraryItem } from '../../api/plex-api/interfaces/library.interfaces';
import { TmdbIdService } from '../../api/tmdb-api/tmdb-id.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class JellyfinGetterService {
  jellyfinProperties: Property[];
  private readonly logger = new Logger(JellyfinGetterService.name);

  constructor(
    private readonly jellyfinApi: JellyfinApiService,
    private readonly tmdbIdHelper: TmdbIdService,
  ) {
    const ruleConstanst = new RuleConstants();
    this.jellyfinProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.JELLYFIN,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem) {
    try {
      const prop = this.jellyfinProperties.find((el) => el.id === id);
      const tmdb = await this.tmdbIdHelper.getTmdbIdFromPlexRatingKey(libItem.ratingKey);

      if (tmdb) {
        switch (prop.name) {
          case 'lastViewedAt': {
            return await this.jellyfinApi
              .getLastSeen(tmdb.id, libItem)
              .then((seenby) => {
                return seenby;
              })
              .catch(() => {
                return null;
              });
          }
          case 'viewCount': {
            return await this.jellyfinApi
              .getTimesViewed(tmdb.id, libItem)
              .then((count) => {
                return count;
              })
              .catch(() => {
                return null;
              });
          }
        }
      } else {
        this.logger.debug(
          `Couldn't fetch Jellyfin metadata for media '${libItem.title}' with tmdb id '${tmdb.id}'. As a result, no Jellyfin query could be made.`,
        );
        return null;
      }
    } catch (e) {
      this.logger.warn(`Jellyfin-Getter - Action failed : ${e.message}`);
      return undefined;
    }
  }
}
