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
  TautulliHistoryRequestOptions,
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
        case 'seenBy':
        case 'sw_watchers': {
          const options: TautulliHistoryRequestOptions = {};

          if (
            metadata.media_type == 'episode' ||
            metadata.media_type == 'movie'
          ) {
            options.rating_key = metadata.rating_key;
          } else if (metadata.media_type == 'season') {
            options.parent_rating_key = metadata.rating_key;
          } else {
            options.grandparent_rating_key = metadata.rating_key;
          }

          const history = await this.tautulliApi.getHistory(options);

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
        case 'addDate': {
          return new Date(+metadata.added_at * 1000);
        }
        case 'viewCount':
        case 'sw_amountOfViews': {
          const itemWatchTimeStats =
            await this.tautulliApi.getItemWatchTimeStats({
              rating_key: metadata.rating_key,
              grouping: 1,
            });

          return itemWatchTimeStats.find((x) => x.query_days == 0).total_plays;
        }
        case 'lastViewedAt': {
          // get_metadata has a last_viewed_at field which would be easier but it's not correct
          const options: TautulliHistoryRequestOptions = {};

          if (
            metadata.media_type == 'movie' ||
            metadata.media_type == 'episode'
          ) {
            options.rating_key = metadata.rating_key;
          } else if (metadata.media_type == 'season') {
            options.parent_rating_key = metadata.rating_key;
          } else {
            options.grandparent_rating_key = metadata.rating_key;
          }

          const history = await this.tautulliApi.getHistory(options);
          const sortedHistory = history
            .filter((x) => x.watched_status == 1)
            .map((el) => el.stopped)
            .sort()
            .reverse();

          return sortedHistory.length > 0
            ? new Date(sortedHistory[0] * 1000)
            : null;
        }
        case 'sw_viewedEpisodes': {
          const history =
            metadata.media_type !== 'season'
              ? await this.tautulliApi.getHistory({
                  grandparent_rating_key: metadata.rating_key,
                })
              : await this.tautulliApi.getHistory({
                  parent_rating_key: metadata.rating_key,
                });

          const watchedEpisodes = history
            .filter((x) => x.watched_status == 1)
            .map((x) => x.rating_key);

          const uniqueEpisodes = [...new Set(watchedEpisodes)];

          return uniqueEpisodes.length;
        }
        case 'sw_lastWatched': {
          let history =
            metadata.media_type !== 'season'
              ? await this.tautulliApi.getHistory({
                  grandparent_rating_key: metadata.rating_key,
                })
              : await this.tautulliApi.getHistory({
                  parent_rating_key: metadata.rating_key,
                });

          history
            .filter((x) => x.watched_status == 1)
            .sort((a, b) => a.parent_media_index - b.parent_media_index)
            .reverse();

          history = history.filter(
            (el) => el.parent_media_index === history[0].parent_media_index,
          );
          history.sort((a, b) => a.media_index - b.media_index).reverse();

          return history.length > 0
            ? new Date(history[0].stopped * 1000)
            : null;
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
