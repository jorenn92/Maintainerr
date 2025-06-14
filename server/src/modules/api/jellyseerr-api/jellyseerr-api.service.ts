import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { MaintainerrLogger } from '../../logging/logs.service';
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

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
    private readonly logger: MaintainerrLogger,
  ) {
    this.logger.setContext(JellyseerrApiService.name);
  }

  public init() {
    this.api = new JellyseerrApi(
      {
        url: `${this.settings.jellyseerr_url?.replace(/\/$/, '')}/api/v1`,
        apiKey: `${this.settings.jellyseerr_api_key}`,
      },
      this.logger,
    );
  }

  public async getMovie(id: string | number): Promise<JellyseerrMovieResponse> {
    const response: JellyseerrMovieResponse = await this.api.get(
      `/movie/${id}`,
    );
    return response;
  }

  public async getShow(showId: string | number): Promise<JellyseerrTVResponse> {
    if (showId) {
      const response: JellyseerrTVResponse = await this.api.get(
        `/tv/${showId}`,
      );
      return response;
    }
  }

  public async getSeason(
    showId: string | number,
    season: string,
  ): Promise<JellyseerrSeasonResponse> {
    if (showId) {
      const response: JellyseerrSeasonResponse = await this.api.get(
        `/tv/${showId}/season/${season}`,
      );
      return response;
    }
  }

  public async deleteRequest(requestId: string) {
    const response: JellyseerrBasicApiResponse = await this.api.delete(
      `/request/${requestId}`,
    );
    return response;
  }

  public async removeSeasonRequest(tmdbid: string | number, season: number) {
    const media = await this.getShow(tmdbid);

    if (media?.mediaInfo?.requests) {
      const requests = media.mediaInfo.requests.filter((el) =>
        el.seasons?.find((s) => s.seasonNumber === season),
      );

      if (requests.length > 0) {
        for (const el of requests) {
          await this.deleteRequest(el.id.toString());
        }
      } else {
        // no requests ? clear data and let Jellyseerr refetch.
        await this.api.delete(`/media/${media.id}`);
      }
    }
  }

  public async deleteMediaItem(mediaId: string | number) {
    const response: JellyseerrBasicApiResponse = await this.api.delete(
      `/media/${mediaId}`,
    );
    return response;
  }

  public async removeMediaByTmdbId(id: string | number, type: 'movie' | 'tv') {
    let media: JellyseerrMovieResponse | JellyseerrTVResponse;
    if (type === 'movie') {
      media = await this.getMovie(id);
    } else {
      media = await this.getShow(id);
    }

    if (!media.mediaInfo?.id) {
      return;
    }

    await this.deleteMediaItem(media.mediaInfo.id.toString());
  }

  public async status(): Promise<JellyseerrStatus> {
    const response: JellyseerrStatus = await this.api.getWithoutCache(
      `/status`,
      {
        signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
      },
    );
    return response;
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
      this.logger.error(
        `A failure occurred testing Jellyseerr connectivity`,
        e,
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
