import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { 
  OmbiApiService, 
  OmbiMovieResponse, 
  OmbiTvResponse 
} from '../../api/ombi-api/ombi-api.service';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { PlexLibraryItem } from '../../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../../api/plex-api/plex-api.service';
import { TmdbIdService } from '../../api/tmdb-api/tmdb-id.service';
import { MaintainerrLogger } from '../../logging/logs.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class OmbiGetterService {
  appProperties: Property[];

  constructor(
    private readonly ombiApi: OmbiApiService,
    private readonly plexApi: PlexApiService,
    private readonly tmdbIdHelper: TmdbIdService,
    private readonly logger: MaintainerrLogger,
  ) {
    logger.setContext(OmbiGetterService.name);
    const ruleConstants = new RuleConstants();
    this.appProperties = ruleConstants.applications.find(
      (el) => el.id === Application.OMBI,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem, dataType?: EPlexDataType) {
    try {
      let origLibItem = undefined;
      let tvMediaResponse: OmbiTvResponse = undefined;
      let movieMediaResponse: OmbiMovieResponse = undefined;

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

      if (tmdb && tmdb.id) {
        if (libItem.type === 'movie') {
          movieMediaResponse = await this.ombiApi.getMovie(tmdb.id.toString());
        } else {
          tvMediaResponse = await this.ombiApi.getShow(tmdb.id.toString());
        }
      } else {
        this.logger.debug(
          `Couldn't find tmdb id for media '${libItem.title}' with id '${libItem.ratingKey}'. As a result, no Ombi query could be made.`,
        );
      }

      const mediaResponse: OmbiTvResponse | OmbiMovieResponse =
        tvMediaResponse ?? movieMediaResponse;

      if (mediaResponse) {
        switch (prop.name) {
          case 'addUser': {
            try {
              const userNames: string[] = [];

              if (libItem.type === 'movie' && movieMediaResponse) {
                // For movies, just get the requesting user
                if (movieMediaResponse.requestedUser) {
                  userNames.push(movieMediaResponse.requestedUser.userName);
                }
              } else if (tvMediaResponse) {
                // For TV shows, check child requests for seasons/episodes
                if (
                  [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType) &&
                  tvMediaResponse.childRequests
                ) {
                  const seasonNum = dataType === EPlexDataType.SEASONS
                    ? origLibItem.index
                    : origLibItem.parentIndex;
                  
                  for (const childRequest of tvMediaResponse.childRequests) {
                    const hasRequestedSeason = childRequest.seasonRequests?.some(
                      season => season.seasonNumber === seasonNum
                    );
                    
                    if (hasRequestedSeason && childRequest.requestedUser) {
                      userNames.push(childRequest.requestedUser.userName);
                    }
                  }
                } else {
                  // For shows, get all requesting users
                  if (tvMediaResponse.requestedUser) {
                    userNames.push(tvMediaResponse.requestedUser.userName);
                  }
                  
                  tvMediaResponse.childRequests?.forEach(childRequest => {
                    if (childRequest.requestedUser) {
                      userNames.push(childRequest.requestedUser.userName);
                    }
                  });
                }
              }

              return [...new Set(userNames)]; // return only unique usernames
            } catch (e) {
              this.logger.warn("Couldn't get addUser from Ombi");
              this.logger.debug(e);
              return [];
            }
          }
          case 'amountRequested': {
            if (libItem.type === 'movie') {
              return movieMediaResponse ? 1 : 0;
            } else {
              if ([EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)) {
                const seasonNum = dataType === EPlexDataType.SEASONS
                  ? origLibItem.index
                  : origLibItem.parentIndex;
                
                return tvMediaResponse?.childRequests?.filter(childRequest =>
                  childRequest.seasonRequests?.some(season => season.seasonNumber === seasonNum)
                ).length || 0;
              }
              return tvMediaResponse?.childRequests?.length || 0;
            }
          }
          case 'requestDate': {
            if (libItem.type === 'movie') {
              return movieMediaResponse?.requestedDate 
                ? new Date(movieMediaResponse.requestedDate) 
                : null;
            } else {
              if ([EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)) {
                const seasonNum = dataType === EPlexDataType.SEASONS
                  ? origLibItem.index
                  : origLibItem.parentIndex;
                
                const childRequest = tvMediaResponse?.childRequests?.find(childRequest =>
                  childRequest.seasonRequests?.some(season => season.seasonNumber === seasonNum)
                );
                
                return childRequest?.requestedDate 
                  ? new Date(childRequest.requestedDate) 
                  : null;
              }
              return tvMediaResponse?.requestedDate 
                ? new Date(tvMediaResponse.requestedDate) 
                : null;
            }
          }
          case 'releaseDate': {
            if (libItem.type === 'movie') {
              return movieMediaResponse?.releaseDate 
                ? new Date(movieMediaResponse.releaseDate) 
                : null;
            } else {
              return tvMediaResponse?.firstAired 
                ? new Date(tvMediaResponse.firstAired) 
                : null;
            }
          }
          case 'approvalDate': {
            if (libItem.type === 'movie') {
              return movieMediaResponse?.approved && movieMediaResponse?.approvedDate
                ? new Date(movieMediaResponse.approvedDate)
                : null;
            } else {
              if ([EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)) {
                const seasonNum = dataType === EPlexDataType.SEASONS
                  ? origLibItem.index
                  : origLibItem.parentIndex;
                
                const childRequest = tvMediaResponse?.childRequests?.find(childRequest =>
                  childRequest.seasonRequests?.some(season => season.seasonNumber === seasonNum)
                );
                
                // For child requests, we use the approved status rather than a specific date
                return childRequest?.approved ? new Date(childRequest.requestedDate) : null;
              }
              return tvMediaResponse?.approved && tvMediaResponse?.requestedDate
                ? new Date(tvMediaResponse.requestedDate)
                : null;
            }
          }
          case 'mediaAddedAt': {
            if (libItem.type === 'movie') {
              return movieMediaResponse?.available && movieMediaResponse?.availableDate
                ? new Date(movieMediaResponse.availableDate)
                : null;
            } else {
              if ([EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)) {
                const seasonNum = dataType === EPlexDataType.SEASONS
                  ? origLibItem.index
                  : origLibItem.parentIndex;
                
                const childRequest = tvMediaResponse?.childRequests?.find(childRequest =>
                  childRequest.seasonRequests?.some(season => season.seasonNumber === seasonNum)
                );
                
                return childRequest?.available ? new Date(childRequest.requestedDate) : null;
              }
              return tvMediaResponse?.available && tvMediaResponse?.requestedDate
                ? new Date(tvMediaResponse.requestedDate)
                : null;
            }
          }
          case 'isRequested': {
            if (libItem.type === 'movie') {
              return movieMediaResponse ? 1 : 0;
            } else {
              if ([EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)) {
                const seasonNum = dataType === EPlexDataType.SEASONS
                  ? origLibItem.index
                  : origLibItem.parentIndex;
                
                const hasSeasonRequest = tvMediaResponse?.childRequests?.some(childRequest =>
                  childRequest.seasonRequests?.some(season => season.seasonNumber === seasonNum)
                );
                
                return hasSeasonRequest ? 1 : 0;
              }
              return tvMediaResponse ? 1 : 0;
            }
          }
          default: {
            return null;
          }
        }
      } else {
        this.logger.debug(
          `Couldn't fetch Ombi metadata for media '${libItem.title}' with id '${libItem.ratingKey}'. As a result, no Ombi query could be made.`,
        );
        return null;
      }
    } catch (e) {
      this.logger.warn(
        `Ombi-Getter - Action failed for '${libItem.title}' with id '${libItem.ratingKey}': ${e.message}`,
      );
      this.logger.debug(e);
      return undefined;
    }
  }
}