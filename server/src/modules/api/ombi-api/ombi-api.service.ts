import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { OmbiApi } from './helpers/ombi-api.helper';

export interface OmbiStoreRepositoryRequestsEpisodeRequests {
  episodeNumber?: number;
  title?: string | null;
  airDate?: Date;
  url?: string | null;
  available?: boolean;
  approved?: boolean;
  requested?: boolean;
  denied?: boolean | null;
  deniedReason?: string | null;
  seasonId?: number;
  season?: OmbiStoreRepositoryRequestsSeasonRequests;
  airDateDisplay?: string | null;
  requestStatus?: string | null;
  id?: number;
}

export interface OmbiStoreRepositoryRequestsSeasonRequests {
  seasonNumber?: number;
  overview?: string | null;
  episodes?: Array<OmbiStoreRepositoryRequestsEpisodeRequests> | null;
  childRequestId?: number;
  childRequest?: OmbiStoreEntitiesRequestsChildRequests;
  seasonAvailable?: boolean;
  id?: number;
}

enum OmbiStoreEntitiesRequestsRequestSource {
  Ombi = 0,
  PlexWatchlist = 1,
}

export interface OmbiStoreEntitiesRequestsChildRequests {
  parentRequest?: OmbiStoreEntitiesRequestsTvRequests;
  parentRequestId?: number;
  issueId?: number | null;
  subscribed?: boolean;
  showSubscribe?: boolean;
  releaseYear?: Date;
  seasonRequests?: Array<OmbiStoreRepositoryRequestsSeasonRequests> | null;
  requestStatus?: string | null;
  requestedUserPlayedProgress?: number;
  approved?: boolean;
  markedAsApproved?: Date;
  requestedDate?: Date;
  available?: boolean;
  markedAsAvailable?: Date | null;
  requestedUserId?: string | null;
  denied?: boolean | null;
  markedAsDenied?: Date;
  deniedReason?: string | null;
  requestType?: OmbiStoreEntitiesRequestType;
  requestedByAlias?: string | null;
  requestedUser?: OmbiStoreEntitiesOmbiUser;
  source?: OmbiStoreEntitiesRequestsRequestSource;
  canApprove?: boolean;
  id?: number;
}

interface OmbiStoreEntitiesRequestsMovieRequests {
  theMovieDbId?: number;
  issueId?: number | null;
  subscribed?: boolean;
  showSubscribe?: boolean;
  is4kRequest?: boolean;
  rootPathOverride?: number;
  qualityOverride?: number;
  has4KRequest?: boolean;
  approved4K?: boolean;
  markedAsApproved4K?: Date;
  requestedDate4k?: Date;
  available4K?: boolean;
  markedAsAvailable4K?: Date | null;
  denied4K?: boolean | null;
  markedAsDenied4K?: Date;
  deniedReason4K?: string | null;
  langCode?: string | null;
  requestStatus?: string | null;
  canApprove?: boolean;
  watchedByRequestedUser?: boolean;
  playedByUsersCount?: number;
  imdbId?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  releaseDate?: Date;
  digitalReleaseDate?: Date | null;
  status?: string | null;
  background?: string | null;
  released?: boolean;
  digitalRelease?: boolean;
  title?: string | null;
  approved?: boolean;
  markedAsApproved?: Date;
  requestedDate?: Date;
  available?: boolean;
  markedAsAvailable?: Date | null;
  requestedUserId?: string | null;
  denied?: boolean | null;
  markedAsDenied?: Date;
  deniedReason?: string | null;
  requestType?: OmbiStoreEntitiesRequestType;
  requestedByAlias?: string | null;
  requestedUser?: OmbiStoreEntitiesOmbiUser;
  source?: OmbiStoreEntitiesRequestsRequestSource;
  id?: number;
}

export interface OmbiStoreEntitiesOmbiUser {
  alias?: string | null;
  userType?: OmbiStoreEntitiesUserType;
  providerUserId?: string | null;
  lastLoggedIn?: Date | null;
  language?: string | null;
  streamingCountry: string;
  userAccessToken?: string | null;
  mediaServerToken?: string | null;
  isEmbyConnect?: boolean;
  userAlias?: string | null;
  emailLogin?: boolean;
  isSystemUser?: boolean;
  id?: string | null;
  userName?: string | null;
  normalizedUserName?: string | null;
  email?: string | null;
  normalizedEmail?: string | null;
  emailConfirmed?: boolean;
  phoneNumber?: string | null;
  phoneNumberConfirmed?: boolean;
  twoFactorEnabled?: boolean;
  lockoutEnd?: Date | null;
  lockoutEnabled?: boolean;
  accessFailedCount?: number;
}

export enum OmbiStoreEntitiesUserType {
  LocalUser = 1,
  PlexUser = 2,
  EmbyUser = 3,
  EmbyConnect = 4,
  JellyfinUser = 5,
}

export enum OmbiStoreEntitiesRequestType {
  TvShow = 0,
  Movie = 1,
  Album = 2,
}

export interface OmbiStoreEntitiesRequestsTvRequests {
  tvDbId?: number;
  externalProviderId?: number;
  imdbId?: string | null;
  qualityOverride?: number | null;
  rootFolder?: number | null;
  languageProfile?: number | null;
  overview?: string | null;
  title?: string | null;
  posterPath?: string | null;
  background?: string | null;
  releaseDate?: Date;
  status?: string | null;
  totalSeasons?: number;
  childRequests?: Array<OmbiStoreEntitiesRequestsChildRequests> | null;
  id?: number;
}

export enum OmbiApiTheMovieDbModelsReleaseDateType {
  Premiere = 1,
  TheatricalLimited = 2,
  Theatrical = 3,
  Digital = 4,
  Physical = 5,
  Tv = 6,
}

export interface OmbiApiTheMovieDbModelsReleaseDateDto {
  releaseDate?: Date;
  type?: OmbiApiTheMovieDbModelsReleaseDateType;
}

export interface OmbiApiTheMovieDbModelsReleaseResultsDto {
  isoCode?: string | null;
  releaseDate?: Array<OmbiApiTheMovieDbModelsReleaseDateDto> | null;
}

export interface OmbiApiTheMovieDbModelsReleaseDatesDto {
  results?: Array<OmbiApiTheMovieDbModelsReleaseResultsDto> | null;
}

export interface OmbiMovieMediaInfo {
  adult?: boolean;
  backdropPath?: string | null;
  originalLanguage?: string | null;
  budget?: number;
  originalTitle?: string | null;
  overview?: string | null;
  popularity?: number;
  revenue?: number;
  runtime?: number;
  posterPath?: string | null;
  releaseDate?: Date | null;
  title?: string | null;
  video?: boolean;
  tagline?: string | null;
  voteAverage?: number;
  voteCount?: number;
  alreadyInCp?: boolean;
  trailer?: string | null;
  homepage?: string | null;
  rootPathOverride?: number;
  status?: string | null;
  qualityOverride?: number;
  type: OmbiStoreEntitiesRequestType.Movie;
  releaseDates?: OmbiApiTheMovieDbModelsReleaseDatesDto;
  digitalReleaseDate?: Date | null;
  has4KRequest?: boolean;
  approved4K?: boolean;
  markedAsApproved4K?: Date;
  requestedDate4k?: Date;
  available4K?: boolean;
  markedAsAvailable4K?: Date | null;
  denied4K?: boolean | null;
  markedAsDenied4K?: Date;
  deniedReason4K?: string | null;
  id?: number;
  approved?: boolean;
  denied?: boolean | null;
  deniedReason?: string | null;
  requested?: boolean;
  requestId?: number;
  available?: boolean;
  plexUrl?: string | null;
  embyUrl?: string | null;
  jellyfinUrl?: string | null;
  quality?: string | null;
  imdbId?: string | null;
  theTvDbId?: string | null;
  theMovieDbId?: string | null;
  subscribed?: boolean;
  showSubscribe?: boolean;
}

export interface OmbiTvMediaInfo {
  title?: string | null;
  aliases?: Array<string> | null;
  banner?: string | null;
  seriesId?: number;
  status?: string | null;
  firstAired?: string | null;
  networkId?: string | null;
  runtime?: string | null;
  overview?: string | null;
  lastUpdated?: number;
  airsDayOfWeek?: string | null;
  airsTime?: string | null;
  rating?: string | null;
  siteRating?: number;
  certification?: string | null;
  tagline?: string | null;
  trailer?: string | null;
  homepage?: string | null;
  seasonRequests?: Array<OmbiStoreRepositoryRequestsSeasonRequests> | null;
  requestAll?: boolean;
  firstSeason?: boolean;
  latestSeason?: boolean;
  fullyAvailable?: boolean;
  partlyAvailable?: boolean;
  type: OmbiStoreEntitiesRequestType.TvShow;
  id?: number;
  approved?: boolean;
  denied?: boolean | null;
  deniedReason?: string | null;
  requested?: boolean;
  requestId?: number;
  available?: boolean;
  plexUrl?: string | null;
  embyUrl?: string | null;
  jellyfinUrl?: string | null;
  quality?: string | null;
  imdbId?: string | null;
  theTvDbId?: string | null;
  theMovieDbId?: string | null;
  subscribed?: boolean;
  showSubscribe?: boolean;
}

export interface OverSeerrMediaResponse {
  id: number;
  imdbid: string;
  collection: OverseerCollection;
  mediaInfo: OverseerrMediaInfo;
  releaseDate?: Date;
  firstAirDate?: Date;
}
interface OverseerCollection {
  id: number;
  name: string;
  posterPath: string;
  backdropPath: string;
  createdAt: string;
  updatedAt: string;
}

interface OverseerrMediaInfo {
  id: number;
  tmdbId: number;
  tvdbId: number;
  status: number;
  updatedAt: string;
  mediaAddedAt: string;
  externalServiceId: number;
  externalServiceId4k: number;
  requests?: OverseerrRequest[];
  seasons?: OverseerrSeason[];
}

export interface OverseerrRequest {
  id: number;
  status: number;
  media: OverseerMedia;
  createdAt: string;
  updatedAt: string;
  requestedBy: OverseerrUser;
  modifiedBy: OverseerrUser;
  is4k: false;
  serverId: number;
  profileId: number;
  rootFolder: string;
  seasons: OverseerrSeason[];
}

interface OverseerrUser {
  id: number;
  email: string;
  username: string;
  plexToken: string;
  plexId?: number;
  plexUsername: string;
  userType: number;
  permissions: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
}

export interface OverseerrSeason {
  id: number;
  name: string;
  seasonNumber: number;
  requestedBy: OverseerrUser;
  // episodes: OverseerrEpisode[];
}

export enum OverseerrMediaStatus {
  UNKNOWN = 1,
  PENDING,
  PROCESSING,
  PARTIALLY_AVAILABLE,
  AVAILABLE,
}

export interface OverseerBasicApiResponse {
  code: string;
  description: string;
}

interface OverseerMedia {
  downloadStatus: [];
  downloadStatus4k: [];
  id: number;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  tvdbId: number;
  imdbId: number;
  status: number;
  status4k: number;
  createdAt: string;
  updatedAt: string;
  lastSeasonChange: string;
  mediaAddedAt: string;
  serviceId: number;
  serviceId4k: number;
  externalServiceId: number;
  externalServiceId4k: number;
  externalServiceSlug: string;
  externalServiceSlug4k: number;
  ratingKey: string;
  ratingKey4k: number;
  seasons: [];
  plexUrl: string;
  serviceUrl: string;
}

export enum OmbiCoreModelsUserType {
  NUMBER_1 = 1,
  NUMBER_2 = 2,
  NUMBER_3 = 3,
  NUMBER_5 = 5,
}

interface OmbiUserResponseResult {
  id?: string | null;
  userName?: string | null;
  alias?: string | null;
  emailAddress?: string | null;
  lastLoggedIn?: Date | null;
  hasLoggedIn?: boolean;
  userType?: OmbiCoreModelsUserType;
}

@Injectable()
export class OmbiApiService {
  api: OmbiApi;

  private readonly logger = new Logger(OmbiApiService.name);
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {}

  public async init() {
    this.api = new OmbiApi({
      url: `${this.settings.ombi_url}/api`,
      cacheName: 'ombi',
      apiKey: `${this.settings.ombi_api_key}`,
    });
  }

  public async getMovie(id: string | number): Promise<OmbiMovieMediaInfo> {
    try {
      const response: OmbiMovieMediaInfo = await this.api.get(
        `/v2/Search/movie/${id}`,
      );

      if (!response) {
        this.logger.warn(
          `Couldn't fetch Ombi movie with ID ${id}. Is the application running?`,
        );
        return undefined;
      }

      return response;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getMovieRequest(
    id: string | number,
  ): Promise<OmbiStoreEntitiesRequestsMovieRequests> {
    try {
      const response: OmbiStoreEntitiesRequestsMovieRequests =
        await this.api.get(`/v1/Request/movie/info/${id}`);

      if (!response) {
        this.logger.warn(
          `Couldn't fetch Ombi movie with ID ${id}. Is the application running?`,
        );
        return undefined;
      }

      return response;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getShowRequest(
    id: string | number,
  ): Promise<OmbiStoreEntitiesRequestsTvRequests> {
    try {
      const response: OmbiStoreEntitiesRequestsTvRequests = await this.api.get(
        `/v1/Request/tv/${id}`,
      );

      if (!response) {
        this.logger.warn(
          `Couldn't fetch Ombi show with ID ${id}. Is the application running?`,
        );
        return undefined;
      }

      return response;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getShow(
    showId: string | number,
    season?: string,
  ): Promise<OmbiTvMediaInfo> {
    try {
      if (showId) {
        const response = this.api.get<OmbiTvMediaInfo>(
          `/v2/Search/tv/${showId}`,
        );

        if (!response) {
          this.logger.warn(
            `Couldn't fetch Ombi show with ID ${showId}. Is the application running?`,
          );
          return undefined;
        }

        return response;
      }
      return undefined;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getUsers(): Promise<OmbiUserResponseResult[]> {
    try {
      const users: OmbiUserResponseResult[] =
        await this.api.get(`/Identity/Users`);

      if (users == null) {
        this.logger.warn(
          `Couldn't fetch Ombi users. Is the application running?`,
        );
        return [];
      }

      return users;
    } catch (err) {
      this.logger.warn(
        `Couldn't fetch Ombi users. Is the application running?`,
      );
      this.logger.debug(err);
      return [];
    }
  }

  /*public async deleteRequest(requestId: string) {
    try {
      const response: OverseerBasicApiResponse = await this.api.delete(
        `/request/${requestId}`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Overseerr communication failed. Is the application running?',
        err,
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async removeSeasonRequest(tmdbid: string | number, season: number) {
    try {
      const media = await this.getShow(tmdbid);

      if (media && media.mediaInfo) {
        const requests = media.mediaInfo.requests.filter((el) =>
          el.seasons.find((s) => s.seasonNumber === season),
        );
        if (requests.length > 0) {
          requests.forEach((el) => {
            this.deleteRequest(el.id.toString());
          });
        } else {
          // no requests ? clear data and let Overseerr refetch.
          await this.api.delete(`/media/${media.id}`);
        }

        // can't clear season data. Overserr doesn't have media ID's for seasons...

        // const seasons = media.mediaInfo.seasons?.filter(
        //   (el) => el.seasonNumber === season,
        // );

        // if (seasons.length > 0) {
        //   for (const el of seasons) {
        //     const resp = await this.api.post(`/media/${el.id}/unknown`);
        //     console.log(resp);
        //   }
        // }
      }
    } catch (err) {
      this.logger.warn(
        'Overseerr communication failed. Is the application running?',
        err,
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async deleteMediaItem(mediaId: string | number) {
    try {
      const response: OverseerBasicApiResponse = await this.api.delete(
        `/media/${mediaId}`,
      );
      return response;
    } catch (e) {
      this.logger.log("Couldn't delete media. Does it exist in Overseerr?", {
        label: 'Overseerr API',
        errorMessage: e.message,
        mediaId,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async removeMediaByTmdbId(id: string | number, type: 'movie' | 'tv') {
    try {
      let media: OverSeerrMediaResponse;
      if (type === 'movie') {
        media = await this.getMovie(id);
      } else {
        media = await this.getShow(id);
      }
      if (media && media.mediaInfo) {
        try {
          if (media.mediaInfo.id) {
            this.deleteMediaItem(media.mediaInfo.id.toString());
          }
        } catch (e) {
          this.logger.log(
            "Couldn't delete media. Does it exist in Overseerr?",
            {
              label: 'Overseerr API',
              errorMessage: e.message,
              id,
            },
          );
        }
      }
    } catch (err) {
      this.logger.warn(
        'Overseerr communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }*/

  public async status(): Promise<string | null> {
    try {
      const response: string = await this.api.getWithoutCache(`/Status/info`, {
        signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
      });

      if (!response) {
        this.logger.warn("Couldn't fetch Ombi status!");
        return null;
      }

      return response;
    } catch (e) {
      this.logger.warn("Couldn't fetch Ombi status!", {
        label: 'Ombi API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }
}
