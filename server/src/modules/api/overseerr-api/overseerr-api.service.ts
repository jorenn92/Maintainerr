import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from 'src/modules/settings/settings.service';
import { OverseerrApi } from './helpers/overseerr-api.helper';

export interface OverSeerrMediaResponse {
  id: number;
  imdbid: string;
  collection: OverseerCollection;
  mediaInfo: OverseerrMediaInfo;
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
}

interface OverseerrRequest {
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
}

interface OverseerrUser {
  id: number;
  email: string;
  username: string;
  plexToken: string;
  plexUsername: string;
  userType: number;
  permissions: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
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

@Injectable()
export class OverseerrApiService {
  api: OverseerrApi;

  private readonly logger = new Logger(OverseerrApiService.name);
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {}

  public async init() {
    this.api = new OverseerrApi({
      url: `${this.settings.overseerr_url}/api/v1`,
      apiKey: `${this.settings.overseerr_api_key}`,
    });
  }

  public async getMovie(id: string | number): Promise<OverSeerrMediaResponse> {
    const response: OverSeerrMediaResponse = await this.api.get(`/movie/${id}`);
    return response;
  }

  public async getShow(
    showId: string | number,
    season?: string,
  ): Promise<OverSeerrMediaResponse> {
    if (showId) {
      const response: OverSeerrMediaResponse = season
        ? await this.api.get(`/tv/${showId}/season/${season}`)
        : await this.api.get(`/tv/${showId}`);
      return response;
    }
    return undefined;
  }

  public async deleteRequest(requestId: string) {
    const response: OverseerBasicApiResponse = await this.api.delete(
      `/request/${requestId}`,
    );
    return response;
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
      return null;
    }
  }

  public async removeMediaByTmdbId(id: string | number, type: 'movie' | 'tv') {
    this.logger.log('Deleting media from Overseerr.', {
      label: 'Overseerr API',
      id,
    });
    let media: OverSeerrMediaResponse;
    if (type === 'movie') {
      media = await this.getMovie(id);
    } else {
      media = await this.getShow(id);
    }
    for (const request of media.mediaInfo?.requests) {
      try {
        if (request?.media) {
          this.deleteMediaItem(request.media.id.toString());
        }
      } catch (e) {
        this.logger.log("Couldn't delete media. Does it exist in Overseerr?", {
          label: 'Overseerr API',
          errorMessage: e.message,
          id,
        });
      }
    }
  }
}
