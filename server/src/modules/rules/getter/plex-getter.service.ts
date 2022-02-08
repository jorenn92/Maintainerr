import { Injectable } from '@nestjs/common';
import { isNull } from 'lodash';
import {
  PlexHub,
  PlexLibraryItem,
  PlexSeenBy,
  PlexUser,
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
          .getSeenBy(libItem.ratingKey)
          .catch((_err) => {
            return null;
          });
        return viewers ? viewers.map((el) => +el.accountID) : [];
      }
      case 'releaseDate': {
        return libItem.originallyAvailableAt
          ? new Date(+libItem.originallyAvailableAt * 1000)
          : null;
      }
      case 'rating': {
        return libItem.rating ? +libItem.rating : 0;
      }
      case 'people': {
        return libItem.Role ? libItem.Role.map((el) => el.tag) : null;
      }
      case 'viewCount': {
        return libItem.viewCount ? +libItem.viewCount : 0;
      }
      case 'collections': {
        return null; // TODO
      }
      case 'lastViewedAt': {
        return await this.plexApi
          .getSeenBy(libItem.ratingKey)
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
                .getSeenBy(episode.ratingKey)
                .catch((_err) => {
                  return null;
                });
              allViewers =
                viewers && viewers.length > 0
                  ? allViewers.concat(viewers)
                  : allViewers;
            } else {
              const viewers: PlexSeenBy[] = await this.plexApi
                .getSeenBy(episode.ratingKey)
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
      case 'sw_lastSeenEpisode': {
        return libItem.lastViewedAt ? +libItem.lastViewedAt : null;
      }
      case 'sw_episodes': {
        return libItem.leafCount ? +libItem.leafCount : 0;
      }
      case 'sw_viewedEpisodes': {
        return libItem.viewedLeafCount ? +libItem.viewedLeafCount : 0;
      }
      case 'sw_lastEpisodeAddedAt': {
        return libItem.updatedAt ? +libItem.updatedAt : null;
      }
      default: {
        return null;
      }
    }
  }
}
