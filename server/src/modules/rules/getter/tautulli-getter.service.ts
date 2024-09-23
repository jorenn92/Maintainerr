import { Injectable, Logger } from '@nestjs/common';
import { PlexLibraryItem } from '../../../modules/api/plex-api/interfaces/library.interfaces';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import _ from 'lodash';
import {
  TautulliApiService,
  TautulliMetadata,
} from '../../api/tautulli-api/tautulli-api.service';

@Injectable()
export class TautulliGetterService {
  appProperties: Property[];
  private readonly logger = new Logger(TautulliGetterService.name);

  constructor(private readonly tautulliApi: TautulliApiService) {
    const ruleConstanst = new RuleConstants();
    this.appProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.TAUTULLI,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem, dataType?: EPlexDataType) {
    try {
      const prop = this.appProperties.find((el) => el.id === id);
      const metadata = await this.tautulliApi.getMetadata(libItem.ratingKey);

      switch (prop.name) {
        case 'seenBy': {
          const history = await this.tautulliApi.getHistory({
            rating_key: metadata.rating_key,
            media_type: 'movie',
          });

          if (history.length > 0) {
            const viewers = history
              .filter((x) => x.watched_status == 1)
              .map((el) => el.user);

            const uniqueViewers = [...new Set(viewers)];

            return uniqueViewers;
          } else {
            return [];
          }
        }
        case 'sw_allEpisodesSeenBy': {
          const users = await this.tautulliApi.getUsers();
          let seasons: TautulliMetadata[];

          if (metadata.media_type !== 'season') {
            seasons = await this.tautulliApi.getChildrenMetadata(
              metadata.rating_key,
            );
          } else {
            seasons = [metadata];
          }

          const allViewers = users.slice();
          for (const season of seasons) {
            const episodes = await this.tautulliApi.getChildrenMetadata(
              season.rating_key,
            );

            for (const episode of episodes) {
              const viewers = await this.tautulliApi.getHistory({
                rating_key: episode.rating_key,
                media_type: 'episode',
              });

              const arrLength = allViewers.length - 1;
              allViewers
                .slice()
                .reverse()
                .forEach((el, idx) => {
                  if (
                    !viewers?.find(
                      (viewEl) =>
                        viewEl.watched_status == 1 &&
                        el.user_id === viewEl.user_id,
                    )
                  ) {
                    allViewers.splice(arrLength - idx, 1);
                  }
                });
            }
          }

          if (allViewers && allViewers.length > 0) {
            const viewerIds = allViewers.map((el) => el.user_id);
            return users
              .filter((el) => viewerIds.includes(el.user_id))
              .map((el) => el.username);
          }

          return [];
        }
        default: {
          return null;
        }
      }
    } catch (e) {
      console.log(e);
      this.logger.warn(`Tautulli-Getter - Action failed : ${e.message}`);
      return undefined;
    }
  }
}
