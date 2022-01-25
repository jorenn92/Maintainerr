import { Injectable, Logger } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
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
export class OverseerrApiService extends OverseerrApi {
  constructor(private readonly loggerService: LoggerService) {
    super({
      url: `http://192.168.0.2:5055/api/v1`,
      apiKey:
        'MTYyODA3MDUwNzU1NjMwNmZjNzk4LWMwMWItNGM2OC04NmU4LTA5ZGU2NzQ1ODc4Yyk=',
    });
  }

  public async getMovie(id: string | number): Promise<OverSeerrMediaResponse> {
    const response: OverSeerrMediaResponse = await this.get(`/movie/${id}`);
    return response;
  }

  public async getShow(
    showId: string | number,
    season?: string,
  ): Promise<OverSeerrMediaResponse> {
    const response: OverSeerrMediaResponse = season
      ? await this.get(`/tv/${showId}/season/${season}`)
      : await this.get(`/tv/${showId}`);
    return response;
  }

  public async deleteRequest(requestId: string) {
    const response: OverseerBasicApiResponse = await this.delete(
      `/request/${requestId}`,
    );
    return response;
  }

  public async deleteMediaItem(mediaId: string | number) {
    try {
      const response: OverseerBasicApiResponse = await this.delete(
        `/media/${mediaId}`,
      );
      return response;
    } catch (e) {
      this.loggerService.logger.info(
        "Couldn't delete media. Does it exist in Overseerr?",
        {
          label: 'Overseerr API',
          errorMessage: e.message,
          mediaId,
        },
      );
      return null;
    }
  }

  public async removeMediaByTmdbId(id: string | number, type: 'movie' | 'tv') {
    this.loggerService.logger.info('Deleting media from Overseerr.', {
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
        this.loggerService.logger.info(
          "Couldn't delete media. Does it exist in Overseerr?",
          {
            label: 'Overseerr API',
            errorMessage: e.message,
            id,
          },
        );
      }
    }
  }
}
