import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { SettingsService } from '../../settings/settings.service';
import { BasicResponseDto } from '../external-api/dto/basic-response.dto';
import { JellyseerrApi } from './helpers/jellyseerr-api.helper';

interface JellyseerrMediaInfo {
  id: number;
  tmdbId: number;
  tvdbId: number;
  status: number;
  updatedAt: string;
  mediaAddedAt: string;
  externalServiceId: number;
  externalServiceId4k: number;
}

export interface JellyseerrMovieResponse {
  id: number;
  mediaInfo?: JellyseerrMovieInfo;
  releaseDate?: Date;
}

interface JellyseerrMovieInfo extends JellyseerrMediaInfo {
  mediaType: 'movie';
  requests?: JellyseerrMovieRequest[];
}

export interface JellyseerrTVResponse {
  id: number;
  mediaInfo?: JellyseerrTVInfo;
  firstAirDate?: Date;
}

interface JellyseerrTVInfo extends JellyseerrMediaInfo {
  mediaType: 'tv';
  requests?: JellyseerrTVRequest[];
  seasons?: JellyseerrSeasonResponse[];
}

export interface JellyseerrSeasonResponse {
  id: number;
  name: string;
  airDate?: string;
  seasonNumber: number;
  episodes: JellyseerrEpisode[];
}

interface JellyseerrEpisode {
  id: number;
  name: string;
  airDate?: string;
  seasonNumber: number;
  episodeNumber: number;
}

export type JellyseerrBaseRequest = {
  id: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  requestedBy: JellyseerrUser;
  modifiedBy: JellyseerrUser;
  is4k: false;
  serverId: number;
  profileId: number;
  rootFolder: string;
};

export type JellyseerrTVRequest = JellyseerrBaseRequest & {
  type: 'tv';
  media: JellyseerrTVInfo;
  seasons: JellyseerrSeasonRequest[];
};

export type JellyseerrMovieRequest = JellyseerrBaseRequest & {
  type: 'movie';
  media: JellyseerrMovieInfo;
};

export type JellyseerrRequest = JellyseerrMovieRequest | JellyseerrTVRequest;

interface JellyseerrUser {
  id: number;
  email: string;
  username: string;
  plexToken: string;
  plexId?: number;
  plexUsername: string;
  jellyfinUsername?: string;
  userType: number;
  permissions: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
}

export interface JellyseerrSeasonRequest {
  id: number;
  name: string;
  seasonNumber: number;
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

  public async getMovie(
    id: string | number,
  ): Promise<JellyseerrMovieResponse | undefined> {
    const response = await this.api.get<JellyseerrMovieResponse>(
      `/movie/${id}`,
    );
    return response;
  }

  public async getShow(
    showId: string | number,
  ): Promise<JellyseerrTVResponse | undefined> {
    if (!showId) return;

    const response = await this.api.get<JellyseerrTVResponse>(`/tv/${showId}`);
    return response;
  }

  public async getSeason(
    showId: string | number,
    season: string,
  ): Promise<JellyseerrSeasonResponse | undefined> {
    if (!showId) return;

    const response = await this.api.get<JellyseerrSeasonResponse>(
      `/tv/${showId}/season/${season}`,
    );

    return response;
  }

  public async deleteRequest(
    requestId: string,
  ): Promise<JellyseerrBasicApiResponse | undefined> {
    const response = await this.api.delete<JellyseerrBasicApiResponse>(
      `/request/${requestId}`,
    );
    return response;
  }

  public async deleteMediaItem(
    mediaId: string | number,
  ): Promise<JellyseerrBasicApiResponse | undefined> {
    const response = await this.api.delete<JellyseerrBasicApiResponse>(
      `/media/${mediaId}`,
    );
    return response;
  }

  public async removeMediaByTmdbId(
    id: string | number,
    type: 'movie' | 'tv',
  ): Promise<JellyseerrBasicApiResponse | undefined> {
    let media: JellyseerrMovieResponse | JellyseerrTVResponse | undefined;
    if (type === 'movie') {
      media = await this.getMovie(id);
    } else {
      media = await this.getShow(id);
    }

    if (!media?.mediaInfo?.id) {
      return;
    }

    return this.deleteMediaItem(media.mediaInfo.id.toString());
  }

  public async status(): Promise<JellyseerrStatus | undefined> {
    try {
      const response = await this.api.getWithoutCache<JellyseerrStatus>(
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
