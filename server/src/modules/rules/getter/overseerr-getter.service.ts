import { Injectable, Logger } from '@nestjs/common';
import { warn } from 'console';
import _ from 'lodash';
import {
  OverseerrApiService,
  OverSeerrMediaResponse,
  OverseerrMediaStatus,
  OverseerrRequest,
} from '../../api/overseerr-api/overseerr-api.service';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { PlexLibraryItem } from '../../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../../api/plex-api/plex-api.service';
import { TmdbIdService } from '../../api/tmdb-api/tmdb-id.service';
import { TmdbApiService } from '../../api/tmdb-api/tmdb.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class OverseerrGetterService {
  appProperties: Property[];
  private readonly logger = new Logger(OverseerrGetterService.name);

  constructor(
    private readonly overseerrApi: OverseerrApiService,
    private readonly tmdbApi: TmdbApiService,
    private readonly plexApi: PlexApiService,
    private readonly tmdbIdHelper: TmdbIdService,
  ) {
    const ruleConstanst = new RuleConstants();
    this.appProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.OVERSEERR,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem, dataType?: EPlexDataType) {
    try {
      let origLibItem = undefined;
      let seasonMediaResponse = undefined;

      // get original show in case of season / episode
      if (
        dataType === EPlexDataType.SEASONS ||
        dataType === EPlexDataType.EPISODES
      ) {
        origLibItem = _.cloneDeep(libItem);
        libItem = (await this.plexApi.getMetadata(
          dataType === EPlexDataType.SEASONS
            ? libItem.parentRatingKey
            : libItem.grandparentRatingKey,
        )) as unknown as PlexLibraryItem;
      }

      const prop = this.appProperties.find((el) => el.id === id);
      const tmdb = await this.tmdbIdHelper.getTmdbIdFromPlexData(libItem);
      // const overseerrUsers = await this.overseerrApi.getUsers();

      let mediaResponse: OverSeerrMediaResponse;
      if (tmdb && tmdb.id) {
        if (libItem.type === 'movie') {
          mediaResponse = await this.overseerrApi.getMovie(tmdb.id.toString());
        } else {
          mediaResponse = await this.overseerrApi.getShow(tmdb.id.toString());
          if (
            dataType === EPlexDataType.SEASONS ||
            dataType === EPlexDataType.EPISODES
          ) {
            seasonMediaResponse = await this.overseerrApi.getShow(
              tmdb.id.toString(),
              dataType === EPlexDataType.SEASONS
                ? origLibItem.index
                : origLibItem.parentIndex,
            );
            if (!seasonMediaResponse) {
              this.logger.debug(
                `Couldn't fetch season data for '${libItem.title}' season ${
                  dataType === EPlexDataType.SEASONS
                    ? origLibItem.index
                    : origLibItem.parentIndex
                } from Overseerr. As a result, unreliable results are expected.`,
              );
            }
          }
        }
      } else {
        this.logger.debug(
          `Couldn't find tmdb id for media '${libItem.title}' with id '${libItem.ratingKey}'. As a result, no Overseerr query could be made.`,
        );
      }

      if (mediaResponse && mediaResponse.mediaInfo) {
        switch (prop.name) {
          case 'addUser': {
            try {
              const plexUsers = await this.plexApi.getCorrectedUsers();
              const userNames: string[] = [];
              if (
                mediaResponse &&
                mediaResponse.mediaInfo &&
                mediaResponse.mediaInfo.requests
              ) {
                for (const request of mediaResponse.mediaInfo.requests) {
                  // for seasons, only add if user requested the correct season
                  if (
                    dataType === EPlexDataType.SEASONS ||
                    dataType === EPlexDataType.EPISODES
                  ) {
                    const includesSeason = this.includesSeason(
                      request,
                      dataType === EPlexDataType.SEASONS
                        ? origLibItem.index
                        : origLibItem.parentIndex,
                    );
                    if (includesSeason) {
                      if (request.requestedBy?.userType === 2) {
                        userNames.push(request.requestedBy?.username);
                      } else {
                        const user = plexUsers.find(
                          (u) => u.plexId === request.requestedBy?.plexId,
                        )?.username;

                        if (user) {
                          userNames.push(user);
                        }
                      }
                    }
                  } else {
                    // for shows and movies, add every request user
                    if (request.requestedBy?.userType === 2) {
                      userNames.push(request.requestedBy?.username);
                    } else {
                      const user = plexUsers.find(
                        (u) => u.plexId === request.requestedBy?.plexId,
                      )?.username;

                      if (user) {
                        userNames.push(user);
                      }
                    }
                  }
                }
                return [...new Set(userNames)]; // return only unique usernames
              }
              return [];
            } catch (e) {
              this.logger.warn("Couldn't get addUser from Overseerr");
              this.logger.debug(e);
            }
          }
          case 'amountRequested': {
            return [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(
              dataType,
            )
              ? this.getSeasonRequests(origLibItem, mediaResponse).length
              : mediaResponse?.mediaInfo.requests.length;
          }
          case 'requestDate': {
            if (
              [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)
            ) {
              return this.getSeasonRequests(origLibItem, mediaResponse)[0]
                ?.createdAt
                ? new Date(
                    this.getSeasonRequests(
                      origLibItem,
                      mediaResponse,
                    )[0]?.createdAt,
                  )
                : null;
            }
            return mediaResponse?.mediaInfo?.requests[0]?.createdAt
              ? new Date(mediaResponse?.mediaInfo?.requests[0]?.createdAt)
              : null;
          }
          case 'releaseDate': {
            if (libItem.type === 'movie') {
              return mediaResponse?.releaseDate
                ? new Date(mediaResponse?.releaseDate)
                : null;
            } else {
              if (EPlexDataType.EPISODES === dataType) {
                const ep = seasonMediaResponse.episodes?.find(
                  (el) => el.episodeNumber === origLibItem.index,
                );
                return ep?.airDate
                  ? new Date(ep.airDate)
                  : ep?.firstAirDate
                    ? new Date(ep.firstAirDate)
                    : null;
              } else if (EPlexDataType.SEASONS === dataType) {
                return seasonMediaResponse?.airDate
                  ? new Date(seasonMediaResponse.airDate)
                  : seasonMediaResponse?.firstAirDate
                    ? new Date(seasonMediaResponse.firstAirDate)
                    : null;
              } else {
                return mediaResponse?.firstAirDate
                  ? new Date(mediaResponse.firstAirDate)
                  : null;
              }
            }
          }
          case 'approvalDate': {
            if (
              [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)
            ) {
              const season = this.getSeasonRequests(
                origLibItem,
                mediaResponse,
              )[0];
              if (season && season.media) {
                if (
                  season.media.status >=
                  OverseerrMediaStatus.PARTIALLY_AVAILABLE
                ) {
                  return new Date(season.media.updatedAt);
                }
              }
              return null;
            } else {
              return mediaResponse?.mediaInfo.status >=
                OverseerrMediaStatus.PARTIALLY_AVAILABLE
                ? new Date(mediaResponse?.mediaInfo?.updatedAt)
                : null;
            }
          }
          case 'mediaAddedAt': {
            if (
              [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)
            ) {
              const season = this.getSeasonRequests(
                origLibItem,
                mediaResponse,
              )[0];
              if (season && season.media) {
                if (
                  season.media.status >=
                  OverseerrMediaStatus.PARTIALLY_AVAILABLE
                ) {
                  return new Date(season.media.mediaAddedAt);
                }
              }
              return null;
            } else {
              return mediaResponse?.mediaInfo.status >=
                OverseerrMediaStatus.PARTIALLY_AVAILABLE
                ? new Date(mediaResponse?.mediaInfo?.mediaAddedAt)
                : null;
            }
          }
          case 'isRequested': {
            try {
              if (
                [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(
                  dataType,
                )
              ) {
                return this.getSeasonRequests(origLibItem, mediaResponse)
                  .length > 0
                  ? 1
                  : 0;
              } else {
                return mediaResponse?.mediaInfo.requests.length > 0 ? 1 : 0;
              }
            } catch (e) {
              return 0;
            }
          }
          default: {
            return null;
          }
        }
      } else {
        this.logger.debug(
          `Couldn't fetch Overseerr metadate for media '${libItem.title}' with id '${libItem.ratingKey}'. As a result, no Overseerr query could be made.`,
        );
        return null;
      }
    } catch (e) {
      warn(
        `Overseerr-Getter - Action failed for '${libItem.title}' with id '${libItem.ratingKey}': ${e.message}`,
      );
      this.logger.debug(e);
      return undefined;
    }
  }

  private getSeasonRequests(
    libItem: PlexLibraryItem,
    mediaResponse: OverSeerrMediaResponse,
  ) {
    const seasonRequests: OverseerrRequest[] = [];
    mediaResponse.mediaInfo?.requests.forEach((el) => {
      const season = el.seasons.find(
        (season) =>
          +season.seasonNumber ===
          (libItem.type === 'episode' ? +libItem.parentIndex : +libItem.index),
      );
      if (season) {
        seasonRequests.push(el);
      }
    });
    return seasonRequests;
  }

  private includesSeason(request: OverseerrRequest, seasonNumber: number) {
    const season = request.seasons.find(
      (season) => season.seasonNumber === seasonNumber,
    );
    return season !== undefined;
  }
}
