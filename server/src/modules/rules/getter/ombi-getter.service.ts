import { Injectable, Logger } from '@nestjs/common';
import { warn } from 'console';
import {
  OmbiApiService,
  OmbiMovieMediaInfo,
  OmbiTvMediaInfo,
  OmbiStoreEntitiesRequestType,
  OmbiStoreEntitiesUserType,
  OmbiStoreEntitiesRequestsTvRequests,
  OmbiStoreEntitiesOmbiUser,
} from '../../../modules/api/ombi-api/ombi-api.service';
import {
  PlexLibraryItem,
  SimplePlexUser,
} from '../../../modules/api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../../../modules/api/plex-api/plex-api.service';
import { TmdbIdService } from '../../../modules/api/tmdb-api/tmdb-id.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import _ from 'lodash';

@Injectable()
export class OmbiGetterService {
  appProperties: Property[];
  private readonly logger = new Logger(OmbiGetterService.name);

  constructor(
    private readonly ombiApi: OmbiApiService,
    private readonly plexApi: PlexApiService,
    private readonly tmdbIdHelper: TmdbIdService,
  ) {
    const ruleConstanst = new RuleConstants();
    this.appProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.OMBI,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem, dataType?: EPlexDataType) {
    try {
      let origLibItem: PlexLibraryItem | undefined = undefined;

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

      let mediaResponse: OmbiMovieMediaInfo | OmbiTvMediaInfo;
      if (tmdb && tmdb.id) {
        if (libItem.type === 'movie') {
          mediaResponse = await this.ombiApi.getMovie(tmdb.id.toString());
        } else {
          mediaResponse = await this.ombiApi.getShow(tmdb.id.toString());
        }
      } else {
        this.logger.debug(
          `Couldn't find tmdb id for media '${libItem.title}' with id '${libItem.ratingKey}'. As a result, no Ombi query could be made.`,
        );
      }

      if (mediaResponse) {
        switch (prop.name) {
          case 'addUser': {
            try {
              if (!mediaResponse.requestId) {
                return [];
              }

              const plexUsers = await this.plexApi.getCorrectedUsers();
              const userNames: string[] = [];

              if (mediaResponse.type === OmbiStoreEntitiesRequestType.Movie) {
                const request = await this.ombiApi.getMovieRequest(
                  mediaResponse.requestId,
                );

                userNames.push(
                  ...this.extractUsernameFromOmbiUser(
                    request.requestedUser,
                    plexUsers,
                  ),
                );
              } else if (
                mediaResponse.type === OmbiStoreEntitiesRequestType.TvShow
              ) {
                const request = await this.ombiApi.getShowRequest(
                  mediaResponse.requestId,
                );

                if (dataType === EPlexDataType.SHOWS) {
                  userNames.push(
                    ...request.childRequests
                      .filter((x) => x.requestedUser)
                      .flatMap((x) =>
                        this.extractUsernameFromOmbiUser(
                          x.requestedUser,
                          plexUsers,
                        ),
                      ),
                  );
                } else if (dataType === EPlexDataType.SEASONS) {
                  const numberOfEpisodes = (
                    await this.plexApi.getChildrenMetadata(
                      origLibItem.ratingKey,
                    )
                  ).length;

                  userNames.push(
                    ...request.childRequests
                      .filter(
                        (x) =>
                          x.requestedUser &&
                          x.seasonRequests.some(
                            (x) =>
                              x.seasonNumber == origLibItem.index &&
                              x.episodes.filter((x) => x.requested).length ==
                                numberOfEpisodes,
                          ),
                      )
                      .flatMap((x) =>
                        this.extractUsernameFromOmbiUser(
                          x.requestedUser,
                          plexUsers,
                        ),
                      ),
                  );
                } else if (dataType === EPlexDataType.EPISODES) {
                  userNames.push(
                    ...request.childRequests
                      .filter(
                        (x) =>
                          x.requestedUser &&
                          x.seasonRequests.some(
                            (x) =>
                              x.seasonNumber == origLibItem.parentIndex &&
                              x.episodes.some(
                                (x) =>
                                  x.requested &&
                                  x.episodeNumber == origLibItem.index,
                              ),
                          ),
                      )
                      .flatMap((x) =>
                        this.extractUsernameFromOmbiUser(
                          x.requestedUser,
                          plexUsers,
                        ),
                      ),
                  );
                }
              }

              return [...new Set(userNames)]; // return only unique usernames
            } catch (e) {
              this.logger.warn("Couldn't get addUser from Ombi");
              this.logger.debug(e);
            }
          }
          /*case 'amountRequested': {
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
                  season.media.status >= OmbiMediaStatus.PARTIALLY_AVAILABLE
                ) {
                  return new Date(season.media.updatedAt);
                }
              }
              return null;
            } else {
              return mediaResponse?.mediaInfo.status >=
                OmbiMediaStatus.PARTIALLY_AVAILABLE
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
                  season.media.status >= OmbiMediaStatus.PARTIALLY_AVAILABLE
                ) {
                  return new Date(season.media.mediaAddedAt);
                }
              }
              return null;
            } else {
              return mediaResponse?.mediaInfo.status >=
                OmbiMediaStatus.PARTIALLY_AVAILABLE
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
            */
          default: {
            return null;
          }
        }
      } else {
        this.logger.debug(
          `Couldn't fetch Ombi metadate for media '${libItem.title}' with id '${libItem.ratingKey}'. As a result, no Ombi query could be made.`,
        );
        return null;
      }
    } catch (e) {
      warn(`Ombi-Getter - Action failed : ${e.message}`);
      this.logger.debug(e);
      return undefined;
    }
  }

  private extractUsernameFromOmbiUser(
    request: OmbiStoreEntitiesOmbiUser,
    plexUsers: SimplePlexUser[],
  ) {
    const userNames: string[] = [];

    if (
      request.userType === OmbiStoreEntitiesUserType.PlexUser &&
      request.providerUserId
    ) {
      const user = plexUsers.find(
        (u) => u.plexId === +request.providerUserId,
      )?.username;

      if (user) {
        userNames.push(user);
      }
    } else if (
      request.userType == OmbiStoreEntitiesUserType.LocalUser &&
      request.userName
    ) {
      userNames.push(request.userName);
    }

    return [...new Set(userNames)];
  }
}
