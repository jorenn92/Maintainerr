import { Injectable } from '@nestjs/common';
import {
  PlexLibraryItem,
  PlexSeenBy,
} from 'src/modules/api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from 'src/modules/api/plex-api/plex-api.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class PlexGetterService {
  plexProperties: Property[];
  constructor(private readonly plexApi: PlexApiService) {
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.PLEX,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem) {
    const prop = this.plexProperties.find((el) => el.id === id);
    switch (prop.name) {
      case 'addDate': {
        return libItem.addedAt ? new Date(+libItem.addedAt * 1000) : null;
      }
      case 'seenBy': {
        // const plexUsers = (await this.plexApi.getUsers()).map((el) => {
        //   return { plexId: el.id, username: el.name } as PlexUser;
        // });
        const viewers: PlexSeenBy[] = await this.plexApi
          .getWatchHistory(libItem.ratingKey)
          .catch((_err) => {
            return null;
          });
        return viewers ? viewers.map((el) => +el.accountID) : [];
      }
      case 'releaseDate': {
        return new Date(libItem.originallyAvailableAt)
          ? new Date(libItem.originallyAvailableAt)
          : null;
      }
      case 'rating': {
        return libItem.rating ? +libItem.rating : 0;
      }
      case 'people': {
        return libItem.Role ? libItem.Role.map((el) => el.tag) : null;
      }
      case 'viewCount': {
        const count = await this.plexApi.getWatchHistory(libItem.ratingKey);
        return count ? count.length : 0;
      }
      case 'collections': {
        return null; // TODO
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
        return libItem.Media[0].videoCodec ? libItem.Media[0].videoCodec : null;
      }
      case 'genre': {
        return libItem.genre ? libItem.genre.map((el) => el.tag) : null;
      }
      case 'sw_allEpisodesSeenBy': {
        const seasons = await this.plexApi.getChildrenMetadata(
          libItem.ratingKey,
        );
        let allViewers: PlexSeenBy[] = [];
        for (const season of seasons) {
          const episodes = await this.plexApi.getChildrenMetadata(
            season.ratingKey,
          );
          for (const episode of episodes) {
            if (season.index === 1 && episode.index === 1) {
              const viewers: PlexSeenBy[] = await this.plexApi
                .getWatchHistory(episode.ratingKey)
                .catch((_err) => {
                  return null;
                });
              allViewers =
                viewers && viewers.length > 0
                  ? allViewers.concat(viewers)
                  : allViewers;
            } else {
              const viewers: PlexSeenBy[] = await this.plexApi
                .getWatchHistory(episode.ratingKey)
                .catch((_err) => {
                  return null;
                });

              if (allViewers) {
                allViewers.forEach((el, index) => {
                  if (
                    !viewers ||
                    !viewers.find((viewEl) => el.accountID === viewEl.accountID)
                  ) {
                    allViewers.splice(index);
                  }
                });
              }
            }
          }
        }

        return allViewers && allViewers.length > 0
          ? allViewers.map((el) => el.accountID)
          : null;
      }
      case 'sw_lastWatched': {
        const watchHistory = await this.plexApi.getWatchHistory(
          libItem.ratingKey,
        );
        return watchHistory ? new Date(+watchHistory[0].viewedAt * 1000) : null;
      }
      case 'sw_episodes': {
        return libItem.leafCount ? +libItem.leafCount : 0;
      }
      case 'sw_viewedEpisodes': {
        let viewCount = 0;
        const seasons = await this.plexApi.getChildrenMetadata(
          libItem.ratingKey,
        );
        for (const season of seasons) {
          const episodes = await this.plexApi.getChildrenMetadata(
            season.ratingKey,
          );
          for (const episode of episodes) {
            const views = await this.plexApi.getWatchHistory(episode.ratingKey);
            views?.length > 0 ? viewCount++ : undefined;
          }
        }
        return viewCount;
      }
      case 'sw_amountOfViews': {
        let viewCount = 0;
        const seasons = await this.plexApi.getChildrenMetadata(
          libItem.ratingKey,
        );
        for (const season of seasons) {
          const episodes = await this.plexApi.getChildrenMetadata(
            season.ratingKey,
          );
          for (const episode of episodes) {
            const views = await this.plexApi.getWatchHistory(episode.ratingKey);
            viewCount =
              views?.length > 0 ? viewCount + views.length : viewCount;
          }
        }
        return viewCount;
      }
      case 'sw_lastEpisodeAddedAt': {
        return new Date(
          +(await this.plexApi
            .getChildrenMetadata(libItem.ratingKey)
            .then((seasons) => {
              return this.plexApi
                .getChildrenMetadata(seasons[seasons.length - 1].ratingKey)
                .then((eps) => {
                  return eps[eps.length - 1]?.addedAt
                    ? +eps[eps.length - 1].addedAt
                    : null;
                });
            })) * 1000,
        );
      }
      default: {
        return null;
      }
    }
  }
}
