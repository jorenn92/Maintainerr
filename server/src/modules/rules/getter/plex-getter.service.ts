import { Injectable, Logger } from '@nestjs/common';
import { warn } from 'console';
import {
  PlexLibraryItem,
  PlexSeenBy,
  PlexUser,
} from '../../..//modules/api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../../../modules/api/plex-api/plex-api.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';
import { EPlexDataType } from 'src/modules/api/plex-api/enums/plex-data-type-enum';
import { RulesDto } from '../dtos/rules.dto';

@Injectable()
export class PlexGetterService {
  plexProperties: Property[];
  private readonly logger = new Logger(PlexGetterService.name);

  constructor(private readonly plexApi: PlexApiService) {
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.PLEX,
    ).props;
  }

  async get(
    id: number,
    libItem: PlexLibraryItem,
    dataType?: EPlexDataType,
    ruleGroup?: RulesDto,
  ) {
    try {
      const prop = this.plexProperties.find((el) => el.id === id);
      switch (prop.name) {
        case 'addDate': {
          return libItem.addedAt ? new Date(+libItem.addedAt * 1000) : null;
        }
        case 'seenBy': {
          const plexUsers = (await this.plexApi.getUsers()).map((el) => {
            return { plexId: el.id, username: el.name } as PlexUser;
          });
          const viewers: PlexSeenBy[] = await this.plexApi
            .getWatchHistory(libItem.ratingKey)
            .catch((_err) => {
              return null;
            });
          if (viewers) {
            const viewerIds = viewers.map((el) => +el.accountID);
            return plexUsers
              .filter((el) => viewerIds.includes(el.plexId))
              .map((el) => el.username);
          } else {
            return [];
          }
        }
        case 'releaseDate': {
          return new Date(libItem.originallyAvailableAt)
            ? new Date(libItem.originallyAvailableAt)
            : null;
        }
        case 'rating': {
          return libItem.audienceRating ? +libItem.audienceRating : 0;
        }
        case 'people': {
          return libItem.Role ? libItem.Role.map((el) => el.tag) : null;
        }
        case 'viewCount': {
          const count = await this.plexApi.getWatchHistory(libItem.ratingKey);
          return count ? count.length : 0;
        }
        case 'collections': {
          // fetch metadata because collections in plexLibrary object are wrong
          return libItem.Collection
            ? (
                await this.plexApi.getMetadata(libItem.ratingKey)
              ).Collection.filter(
                (el) =>
                  el.tag.toLowerCase().trim() !==
                  (ruleGroup.manualCollectionName
                    ? ruleGroup.manualCollectionName
                    : ruleGroup.name
                  )
                    .toLowerCase()
                    .trim(),
              ).length
            : null;
        }
        case 'collection_names': {
          // fetch metadata  because collections in plexLibrary object are wrong
          const moreData = await this.plexApi.getMetadata(libItem.ratingKey);
          return moreData.Collection
            ? moreData.Collection.map((el) => el.tag.trim())
            : null;
        }
        case 'lastViewedAt': {
          return await this.plexApi
            .getWatchHistory(libItem.ratingKey)
            .then((seenby) => {
              if (seenby.length > 0) {
                return new Date(
                  +seenby
                    .map((el) => el.viewedAt)
                    .sort()
                    .reverse()[0] * 1000,
                );
              } else {
                return null;
              }
            })
            .catch((_err) => {
              return null;
            });
        }
        case 'fileVideoResolution': {
          return libItem.Media[0].videoResolution
            ? libItem.Media[0].videoResolution
            : null;
        }
        case 'fileBitrate': {
          return libItem.Media[0].bitrate ? libItem.Media[0].bitrate : 0;
        }
        case 'fileVideoCodec': {
          return libItem.Media[0].videoCodec
            ? libItem.Media[0].videoCodec
            : null;
        }
        case 'genre': {
          const item =
            libItem.type === 'episode'
              ? ((await this.plexApi.getMetadata(
                  libItem.grandparentRatingKey,
                )) as unknown as PlexLibraryItem)
              : libItem.type === 'season'
              ? ((await this.plexApi.getMetadata(
                  libItem.parentRatingKey,
                )) as unknown as PlexLibraryItem)
              : libItem;
          return item.Genre ? item.Genre.map((el) => el.tag) : null;
        }
        case 'sw_allEpisodesSeenBy': {
          const plexUsers = (await this.plexApi.getUsers()).map((el) => {
            return { plexId: el.id, username: el.name } as PlexUser;
          });
          const seasons =
            libItem.type !== 'season'
              ? await this.plexApi.getChildrenMetadata(libItem.ratingKey)
              : [libItem];
          const allViewers = plexUsers.slice();
          for (const season of seasons) {
            const episodes = await this.plexApi.getChildrenMetadata(
              season.ratingKey,
            );
            for (const episode of episodes) {
              const viewers: PlexSeenBy[] = await this.plexApi
                .getWatchHistory(episode.ratingKey)
                .catch((_err) => {
                  return null;
                });

              const arrLength = allViewers.length - 1;
              allViewers
                .slice()
                .reverse()
                .forEach((el, idx) => {
                  if (
                    !viewers ||
                    !viewers.find((viewEl) => el.plexId === viewEl.accountID)
                  ) {
                    allViewers.splice(arrLength - idx, 1);
                  }
                });
            }
          }

          if (allViewers && allViewers.length > 0) {
            const viewerIds = allViewers.map((el) => +el.plexId);
            return plexUsers
              .filter((el) => viewerIds.includes(el.plexId))
              .map((el) => el.username);
          }

          return [];
        }
        case 'sw_watchers': {
          const plexUsers = (await this.plexApi.getUsers()).map((el) => {
            return { plexId: el.id, username: el.name } as PlexUser;
          });

          const watchHistory = await this.plexApi.getWatchHistory(
            libItem.ratingKey,
          );

          const viewers = watchHistory.map((el) => +el.accountID);
          const uniqueViewers = [...new Set(viewers)];

          if (uniqueViewers && uniqueViewers.length > 0) {
            return plexUsers
              .filter((el) => uniqueViewers.includes(+el.plexId))
              .map((el) => el.username);
          }
          return [];
        }
        case 'sw_lastWatched': {
          let watchHistory = await this.plexApi.getWatchHistory(
            libItem.ratingKey,
          );
          watchHistory?.sort((a, b) => a.parentIndex - b.parentIndex).reverse();
          watchHistory = watchHistory?.filter(
            (el) => el.parentIndex === watchHistory[0].parentIndex,
          );
          watchHistory?.sort((a, b) => a.index - b.index).reverse();
          return watchHistory
            ? new Date(+watchHistory[0].viewedAt * 1000)
            : null;
        }
        case 'sw_episodes': {
          if (libItem.type === 'season') {
            const eps = await this.plexApi.getChildrenMetadata(
              libItem.ratingKey,
            );
            return eps.length ? eps.length : 0;
          }

          return libItem.leafCount ? +libItem.leafCount : 0;
        }
        case 'sw_viewedEpisodes': {
          let viewCount = 0;
          const seasons =
            libItem.type !== 'season'
              ? await this.plexApi.getChildrenMetadata(libItem.ratingKey)
              : [libItem];
          for (const season of seasons) {
            const episodes = await this.plexApi.getChildrenMetadata(
              season.ratingKey,
            );
            for (const episode of episodes) {
              const views = await this.plexApi.getWatchHistory(
                episode.ratingKey,
              );
              views?.length > 0 ? viewCount++ : undefined;
            }
          }
          return viewCount;
        }
        case 'sw_amountOfViews': {
          let viewCount = 0;

          // for episodes
          if (libItem.type === 'episode') {
            const views = await this.plexApi.getWatchHistory(libItem.ratingKey);
            viewCount =
              views?.length > 0 ? viewCount + views.length : viewCount;
          } else {
            // for seasons & shows
            const seasons =
              libItem.type !== 'season'
                ? await this.plexApi.getChildrenMetadata(libItem.ratingKey)
                : [libItem];
            for (const season of seasons) {
              const episodes = await this.plexApi.getChildrenMetadata(
                season.ratingKey,
              );
              for (const episode of episodes) {
                const views = await this.plexApi.getWatchHistory(
                  episode.ratingKey,
                );
                viewCount =
                  views?.length > 0 ? viewCount + views.length : viewCount;
              }
            }
          }
          return viewCount;
        }
        case 'sw_lastEpisodeAddedAt': {
          const seasons =
            libItem.type !== 'season'
              ? await this.plexApi.getChildrenMetadata(libItem.ratingKey)
              : [libItem];

          const lastEpDate = await this.plexApi
            .getChildrenMetadata(seasons[seasons.length - 1].ratingKey)
            .then((eps) => {
              return eps[eps.length - 1]?.addedAt
                ? +eps[eps.length - 1].addedAt
                : null;
            });

          return new Date(+lastEpDate * 1000);
        }
        default: {
          return null;
        }
      }
    } catch (e) {
      this.logger.warn(`Plex-Getter - Action failed : ${e.message}`);
      return undefined;
    }
  }
}
