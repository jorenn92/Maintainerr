import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { SettingsService } from '../../../modules/settings/settings.service';
import {
  MaintainerrLogger,
  MaintainerrLoggerFactory,
} from '../../logging/logs.service';
import { BasicResponseDto } from '../external-api/dto/basic-response.dto';
import { OverseerrApi } from './helpers/overseerr-api.helper';

interface OverseerrMediaInfo {
  id: number;
  tmdbId: number;
  tvdbId: number;
  status: number;
  updatedAt: string;
  mediaAddedAt: string;
  externalServiceId: number;
  externalServiceId4k: number;
}

export interface OverSeerrMovieResponse {
  id: number;
  mediaInfo?: OverseerrMovieInfo;
  releaseDate?: Date;
}

interface OverseerrMovieInfo extends OverseerrMediaInfo {
  mediaType: 'movie';
  requests?: OverseerrMovieRequest[];
}

export interface OverSeerrTVResponse {
  id: number;
  mediaInfo?: OverseerrTVInfo;
  firstAirDate?: Date;
}

interface OverseerrTVInfo extends OverseerrMediaInfo {
  mediaType: 'tv';
  requests?: OverseerrTVRequest[];
  seasons?: OverSeerrSeasonResponse[];
}

export interface OverSeerrSeasonResponse {
  id: number;
  name: string;
  airDate?: string;
  seasonNumber: number;
  episodes: OverseerrEpisode[];
}

interface OverseerrEpisode {
  id: number;
  name: string;
  airDate?: string;
  seasonNumber: number;
  episodeNumber: number;
}

export type OverseerrBaseRequest = {
  id: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  requestedBy: OverseerrUser;
  modifiedBy: OverseerrUser;
  is4k: false;
  serverId: number;
  profileId: number;
  rootFolder: string;
};

export type OverseerrTVRequest = OverseerrBaseRequest & {
  type: 'tv';
  media: OverseerrTVInfo;
  seasons: OverseerrSeasonRequest[];
};

export type OverseerrMovieRequest = OverseerrBaseRequest & {
  type: 'movie';
  media: OverseerrMovieInfo;
};

export type OverseerrRequest = OverseerrMovieRequest | OverseerrTVRequest;

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

export interface OverseerrSeasonRequest {
  id: number;
  name: string;
  seasonNumber: number;
}

interface OverseerrStatus {
  version: string;
  commitTag: string;
  updateAvailable: boolean;
  commitsBehind: number;
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

@Injectable()
export class OverseerrApiService {
  api: OverseerrApi;

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
    private readonly logger: MaintainerrLogger,
    private readonly loggerFactory: MaintainerrLoggerFactory,
  ) {
    this.logger.setContext(OverseerrApiService.name);
  }

  public init() {
    this.api = new OverseerrApi(
      {
        url: `${this.settings.overseerr_url?.replace(/\/$/, '')}/api/v1`,
        apiKey: `${this.settings.overseerr_api_key}`,
      },
      this.loggerFactory.createLogger(),
    );
  }

  public async getMovie(id: string | number): Promise<OverSeerrMovieResponse> {
    const response: OverSeerrMovieResponse = await this.api.get(`/movie/${id}`);
    return response;
  }

  public async getShow(showId: string | number): Promise<OverSeerrTVResponse> {
    if (showId) {
      const response: OverSeerrTVResponse = await this.api.get(`/tv/${showId}`);
      return response;
    }
  }

  public async getSeason(
    showId: string | number,
    season: string,
  ): Promise<OverSeerrSeasonResponse> {
    if (showId) {
      const response: OverSeerrSeasonResponse = await this.api.get(
        `/tv/${showId}/season/${season}`,
      );
      return response;
    }
  }

  public async deleteRequest(requestId: string) {
    const response: OverseerBasicApiResponse = await this.api.delete(
      `/request/${requestId}`,
    );
    return response;
  }

  public async removeSeasonRequest(tmdbid: string | number, season: number) {
    const media = await this.getShow(tmdbid);

    if (media?.mediaInfo?.requests) {
      const requests = media.mediaInfo.requests.filter((el) =>
        el.seasons.find((s) => s.seasonNumber === season),
      );

      if (requests.length > 0) {
        for (const el of requests) {
          await this.deleteRequest(el.id.toString());
        }
      } else {
        // no requests ? clear data and let Overseerr refetch.
        await this.api.delete(`/media/${media.id}`);
      }
    }
  }

  public async deleteMediaItem(mediaId: string | number) {
    const response: OverseerBasicApiResponse = await this.api.delete(
      `/media/${mediaId}`,
    );
    return response;
  }

  public async removeMediaByTmdbId(id: string | number, type: 'movie' | 'tv') {
    let media: OverSeerrMovieResponse | OverSeerrTVResponse;
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

  public async status(): Promise<OverseerrStatus> {
    const response: OverseerrStatus = await this.api.getWithoutCache(
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
      this.logger.error(`A failure occurred testing Overseerr connectivity`, e);

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
