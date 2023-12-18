import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../../modules/settings/settings.service';
import { OverseerrApi } from './helpers/overseerr-api.helper';

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
  ) { }

  public async init() {
    this.api = new OverseerrApi({
      url: `${this.settings.overseerr_url}/api/v1`,
      cacheName: 'overseerr',
      apiKey: `${this.settings.overseerr_api_key}`,
    });
  }

  public async getMovie(id: string | number): Promise<OverSeerrMediaResponse> {
    try {
      const response: OverSeerrMediaResponse = await this.api.get(
        `/movie/${id}`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Overseerr communication failed. Is the application running?',
      );
      return undefined;
    }
  }

  public async getShow(
    showId: string | number,
    season?: string,
  ): Promise<OverSeerrMediaResponse> {
    try {
      if (showId) {
        const response: OverSeerrMediaResponse = season
          ? await this.api.get(`/tv/${showId}/season/${season}`)
          : await this.api.get(`/tv/${showId}`);
        return response;
      }
      return undefined;
    } catch (err) {
      this.logger.warn(
        'Overseerr communication failed. Is the application running?',
      );
      return undefined;
    }
  }

  public async deleteRequest(requestId: string) {
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
      return undefined;
    }
  }

  public async status(): Promise<OverseerrStatus> {
    try {
      const response: OverseerrStatus =
        await this.api.getWithoutCache(`/status`, {
          signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
        });
      return response;
    } catch (e) {
      this.logger.log("Couldn't fetch Overseerr status!", {
        label: 'Overseerr API',
        errorMessage: e.message,
      });
      return null;
    }
  }
}
