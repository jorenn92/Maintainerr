import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { SettingsService } from '../../../modules/settings/settings.service';
import {
  MaintainerrLogger,
  MaintainerrLoggerFactory,
} from '../../logging/logs.service';
import { BasicResponseDto } from '../external-api/dto/basic-response.dto';
import { OmbiApi } from './helpers/ombi-api.helper';

interface OmbiMediaInfo {
  id: number;
  theMovieDbId: number;
  theTvDbId: number;
  status: number;
  requestedDate: string;
  available: boolean;
  denied: boolean;
  deniedReason: string;
}

export interface OmbiMovieResponse {
  id: number;
  theMovieDbId: number;
  title: string;
  overview: string;
  releaseDate: string;
  status: number;
  requestedDate: string;
  available: boolean;
  denied: boolean;
  deniedReason: string;
  requestedBy: string;
  requestedUserId: string;
}

export interface OmbiTVResponse {
  id: number;
  theTvDbId: number;
  title: string;
  overview: string;
  firstAired: string;
  status: number;
  requestedDate: string;
  available: boolean; 
  denied: boolean;
  deniedReason: string;
  requestedBy: string;
  requestedUserId: string;
  childRequests: OmbiTVSeasonRequest[];
}

export interface OmbiTVSeasonRequest {
  id: number;
  seasonNumber: number;
  requestedDate: string;
  available: boolean;
  denied: boolean;
  deniedReason: string;
}

interface OmbiUser {
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  alias: string;
  userType: number;
  dateCreated: string;
  lastLoggedIn: string;
}

interface OmbiStatus {
  version: string;
  branch: string;
  updateAvailable: boolean;
}

export enum OmbiRequestStatus {
  PENDING_APPROVAL = 0,
  APPROVED = 1,
  AVAILABLE = 2,
  PROCESSING = 3,
  DENIED = 4,
}

export interface OmbiBasicApiResponse {
  message: string;
  isError: boolean;
  errorMessage: string;
}

interface OmbiUserResponse {
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  alias: string;
  userType: number;
  dateCreated: string;
  lastLoggedIn: string;
}

@Injectable()
export class OmbiApiService {
  api: OmbiApi;

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
    private readonly logger: MaintainerrLogger,
    private readonly loggerFactory: MaintainerrLoggerFactory,
  ) {
    this.logger.setContext(OmbiApiService.name);
  }

  public init() {
    this.api = new OmbiApi(
      {
        url: `${this.settings.ombi_url?.replace(/\/$/, '')}/api/v1`,
        apiKey: `${this.settings.ombi_api_key}`,
      },
      this.loggerFactory.createLogger(),
    );
  }

  public async getMovieRequests(): Promise<OmbiMovieResponse[]> {
    try {
      const response: OmbiMovieResponse[] = await this.api.get(
        `/Request/movie`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return [];
    }
  }

  public async getTVRequests(): Promise<OmbiTVResponse[]> {
    try {
      const response: OmbiTVResponse[] = await this.api.get(
        `/Request/tv`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return [];
    }
  }

  public async getUsers(): Promise<OmbiUserResponse[]> {
    try {
      const response: OmbiUserResponse[] = await this.api.get(
        `/Identity/Users`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        `Couldn't fetch Ombi users. Is the application running?`,
      );
      this.logger.debug(err);
      return [];
    }
  }

  public async deleteMovieRequest(requestId: string): Promise<OmbiBasicApiResponse> {
    try {
      const response: OmbiBasicApiResponse = await this.api.delete(
        `/Request/movie/${requestId}`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async deleteTVRequest(requestId: string): Promise<OmbiBasicApiResponse> {
    try {
      const response: OmbiBasicApiResponse = await this.api.delete(
        `/Request/tv/${requestId}`,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async removeMovieByTmdbId(id: string | number): Promise<void> {
    try {
      const movieRequests = await this.getMovieRequests();
      const targetRequest = movieRequests.find(
        (request) => request.theMovieDbId === Number(id),
      );

      if (targetRequest) {
        await this.deleteMovieRequest(targetRequest.id.toString());
      }
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async removeTVByTmdbId(id: string | number): Promise<void> {
    try {
      const tvRequests = await this.getTVRequests();
      const targetRequest = tvRequests.find(
        (request) => request.theTvDbId === Number(id),
      );

      if (targetRequest) {
        await this.deleteTVRequest(targetRequest.id.toString());
      }
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async removeSeasonRequest(tmdbid: string | number, season: number): Promise<void> {
    try {
      const tvRequests = await this.getTVRequests();
      const targetRequest = tvRequests.find(
        (request) => request.theTvDbId === Number(tmdbid),
      );

      if (targetRequest) {
        const seasonRequest = targetRequest.childRequests.find(
          (child) => child.seasonNumber === season,
        );
        
        if (seasonRequest) {
          // Ombi doesn't have separate season deletion, so we delete the entire TV request
          // This matches the behavior in overseerr service where it can't clear season data
          await this.deleteTVRequest(targetRequest.id.toString());
        }
      }
    } catch (err) {
      this.logger.warn(
        'Ombi communication failed. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async status(): Promise<OmbiStatus> {
    try {
      const response: OmbiStatus = await this.api.getWithoutCache(
        `/Status`,
        {
          signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
        },
      );
      return response;
    } catch (e) {
      this.logger.log(`Couldn't fetch Ombi status: ${e.message}`);
      this.logger.debug(e);
      return null;
    }
  }

  public async validateApiConnectivity(): Promise<BasicResponseDto> {
    try {
      await this.api.getRawWithoutCache(`/Status`, {
        signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
      });

      return {
        status: 'OK',
        code: 1,
        message: 'Success',
      };
    } catch (e) {
      this.logger.warn(
        `A failure occurred testing Ombi connectivity: ${e}`,
      );

      if (e instanceof AxiosError) {
        if (e.response?.status === 401 || e.response?.status === 403) {
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