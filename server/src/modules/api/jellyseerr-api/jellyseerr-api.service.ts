import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { SettingsService } from '../../settings/settings.service';
import { BasicResponseDto } from '../external-api/dto/basic-response.dto';
import { JellyseerrApi } from './helpers/jellyseerr-api.helper';

export interface JellyseerrMediaResponse {
  id: number;
  imdbid: string;
  collection: JellyseerrCollection;
  mediaInfo: JellyseerrMediaInfo;
  releaseDate?: Date;
  firstAirDate?: Date;
}
interface JellyseerrCollection {
  id: number;
  name: string;
  posterPath: string;
  backdropPath: string;
  createdAt: string;
  updatedAt: string;
}

interface JellyseerrMediaInfo {
  id: number;
  tmdbId: number;
  tvdbId: number;
  status: number;
  updatedAt: string;
  mediaAddedAt: string;
  externalServiceId: number;
  externalServiceId4k: number;
  requests?: JellyseerrRequest[];
  seasons?: JellyseerrSeason[];
}

export interface JellyseerrRequest {
  id: number;
  status: number;
  media: JellyseerrMedia;
  createdAt: string;
  updatedAt: string;
  requestedBy: JellyseerrUser;
  modifiedBy: JellyseerrUser;
  is4k: false;
  serverId: number;
  profileId: number;
  rootFolder: string;
  seasons: JellyseerrSeason[];
}

interface JellyseerrUser {
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

export interface JellyseerrSeason {
  id: number;
  name: string;
  seasonNumber: number;
  requestedBy: JellyseerrUser;
  // episodes: JellyseerrEpisode[];
}

interface JellyseerrStatus {
  version: string;
  commitTag: string;
  updateAvailable: boolean;
  commitsBehind: number;
}

export enum JellyseerrMediaStatus {
  UNKNOWN = 1,
  PENDING,
  PROCESSING,
  PARTIALLY_AVAILABLE,
  AVAILABLE,
}

export interface JellyseerrBasicApiResponse {
  code: string;
  description: string;
}

interface JellyseerrMedia {
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

interface JellyseerrUserResponse {
  pageInfo: {
    pages: number;
    pageSize: number;
    results: number;
    page: number;
  };
  results: JellyseerrUserResponseResult[];
}

interface JellyseerrUserResponseResult {
  permissions: number;
  id: number;
  email: string;
  plexUsername: string;
  username: string;
  userType: number;
  plexId: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
  displayName: string;
}

@Injectable()
export class JellyseerrApiService {
  api: JellyseerrApi;

  private readonly logger = new Logger(JellyseerrApiService.name);
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {}

  public async init() {
    this.api = new JellyseerrApi({
      url: `${this.settings.jellyseerr_url?.replace(/\/$/, '')}/api/v1`,
      apiKey: `${this.settings.jellyseerr_api_key}`,
    });
  }

  public async getMovie(id: string | number): Promise<JellyseerrMediaResponse> {
    try {
      const response: JellyseerrMediaResponse = await this.api.get(
        `/movie/${id}`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Jellyseerr communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getShow(
    showId: string | number,
    season?: string,
  ): Promise<JellyseerrMediaResponse> {
    try {
      if (showId) {
        const response: JellyseerrMediaResponse = season
          ? await this.api.get(`/tv/${showId}/season/${season}`)
          : await this.api.get(`/tv/${showId}`);
        return response;
      }
      return undefined;
    } catch (err) {
      this.logger.warn(
        'Jellyseerr communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async getUsers(): Promise<any> {
    try {
      const size = 50;
      let hasNext = true;
      let skip = 0;

      const users: JellyseerrUserResponseResult[] = [];

      while (hasNext) {
        const resp: JellyseerrUserResponse = await this.api.get(
          `/user?take=${size}&skip=${skip}`,
        );

        users.push(...resp.results);

        if (resp?.pageInfo?.page < resp?.pageInfo?.pages) {
          skip = skip + size;
        } else {
          hasNext = false;
        }
      }
      return users;
    } catch (err) {
      this.logger.warn(
        `Couldn't fetch Jellyseerr users. Is the application running?`,
      );
      this.logger.debug(err);
      return [];
    }
  }

  public async deleteRequest(requestId: string) {
    try {
      const response: JellyseerrBasicApiResponse = await this.api.delete(
        `/request/${requestId}`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Jellyseerr communication failed. Is the application running?',
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
          // no requests ? clear data and let Jellyseerr refetch.
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
        'Jellyseerr communication failed. Is the application running?',
        err,
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async deleteMediaItem(mediaId: string | number) {
    try {
      const response: JellyseerrBasicApiResponse = await this.api.delete(
        `/media/${mediaId}`,
      );
      return response;
    } catch (e) {
      this.logger.log("Couldn't delete media. Does it exist in Jellyseerr?", {
        label: 'Jellyseerr API',
        errorMessage: e.message,
        mediaId,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async removeMediaByTmdbId(id: string | number, type: 'movie' | 'tv') {
    try {
      let media: JellyseerrMediaResponse;
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
            "Couldn't delete media. Does it exist in Jellyseerr?",
            {
              label: 'Jellyseerr API',
              errorMessage: e.message,
              id,
            },
          );
        }
      }
    } catch (err) {
      this.logger.warn(
        'Jellyseerr communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async status(): Promise<JellyseerrStatus> {
    try {
      const response: JellyseerrStatus = await this.api.getWithoutCache(
        `/status`,
        {
          signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
        },
      );
      return response;
    } catch (e) {
      this.logger.log("Couldn't fetch Jellyseerr status!", {
        label: 'Jellyseerr API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async validateApiConnectivity(): Promise<BasicResponseDto> {
    try {
      await this.api.getRawWithoutCache(`/settings/about`, {
        signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
      });

      return {
        status: 'OK',
        code: 1,
        message: 'Success',
      };
    } catch (e) {
      this.logger.warn(
        `A failure occurred testing Jellyseerr connectivity: ${e}`,
      );

      if (e instanceof AxiosError) {
        if (e.response?.status === 403) {
          return {
            status: 'NOK',
            code: 0,
            message: 'Invalid API key',
          };
        } else if (e.response?.status) {
          return {
            status: 'NOK',
            code: 0,
            message: `Failure, received response: ${e.response?.status} ${e.response?.statusText}.`,
          };
        }
      }

      return {
        status: 'NOK',
        code: 0,
        message: `Failure: ${e.message}`,
      };
    }
  }
}
