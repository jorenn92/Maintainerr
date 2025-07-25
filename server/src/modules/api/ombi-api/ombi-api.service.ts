import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { 
  MaintainerrLogger,
  MaintainerrLoggerFactory 
} from '../../logging/logs.service';
import { BasicResponseDto } from '../external-api/dto/basic-response.dto';
import { OmbiApi } from './helpers/ombi-api.helper';
import { AxiosError } from 'axios';

// Ombi request interfaces
interface OmbiMediaInfo {
  id: number;
  tmdbId?: number;
  tvDbId?: number;
  imdbId?: string;
  status: number;
  requestedDate: string;
  approved?: boolean;
  approvedDate?: string;
  available?: boolean;
  availableDate?: string;
}

export interface OmbiMovieResponse {
  id: number;
  title: string;
  releaseDate?: string;
  requestedDate: string;
  approved: boolean;
  approvedDate?: string;
  available: boolean;
  availableDate?: string;
  requestedUser?: OmbiUser;
  tmdbId?: number;
  imdbId?: string;
  mediaInfo?: OmbiMediaInfo;
}

export interface OmbiTvResponse {
  id: number;
  title: string;
  firstAired?: string;
  requestedDate: string;
  approved: boolean;
  available: boolean;
  requestedUser?: OmbiUser;
  tmdbId?: number;
  tvDbId?: number;
  childRequests?: OmbiTvChildRequest[];
  mediaInfo?: OmbiMediaInfo;
}

export interface OmbiTvChildRequest {
  id: number;
  seasonRequests: OmbiSeasonRequest[];
  requestedDate: string;
  approved: boolean;
  available: boolean;
  requestedUser?: OmbiUser;
}

export interface OmbiSeasonRequest {
  seasonNumber: number;
  episodes: OmbiEpisodeRequest[];
}

export interface OmbiEpisodeRequest {
  episodeNumber: number;
  title?: string;
  airDate?: string;
}

interface OmbiUser {
  id: string;
  userName: string;
  email?: string;
  userType: number;
}

// Search result interfaces from Ombi API v2
export interface OmbiSearchMovieResponse {
  tmdbId: number;
  imdbId?: string;
  title: string;
  overview?: string;
  releaseDate?: string;
  posterPath?: string;
  backdrop?: string;
  requestStatus?: number;
  available?: boolean;
  request?: OmbiMovieResponse;
}

export interface OmbiSearchTvResponse {
  tmdbId: number;
  tvDbId?: number;
  imdbId?: string;
  title: string;
  overview?: string;
  firstAired?: string;
  posterPath?: string;
  backdrop?: string;
  requestStatus?: number;
  available?: boolean;
  request?: OmbiTvResponse;
}

@Injectable()
export class OmbiApiService {
  private api: OmbiApi;
  
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
    private readonly logger: MaintainerrLogger,
    private readonly loggerFactory: MaintainerrLoggerFactory,
  ) {
    this.logger.setContext(OmbiApiService.name);
  }

  public async init() {
    const settings = await this.settingsService.getSettings();
    
    if (settings instanceof BasicResponseDto || !settings.ombi_url || !settings.ombi_api_key) {
      throw new Error('Ombi is not configured');
    }

    this.api = new OmbiApi(
      {
        url: settings.ombi_url.replace(/\/$/, ''),
        apiKey: settings.ombi_api_key,
      },
      this.loggerFactory.createLogger(),
    );
  }

  async validateApiConnectivity(): Promise<BasicResponseDto> {
    try {
      await this.init();
      const response = await this.api.getRawWithoutCache('/settings/about', {
        signal: AbortSignal.timeout(10000),
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

  async getMovieRequests(): Promise<OmbiMovieResponse[]> {
    try {
      if (!this.api) await this.init();
      return await this.api.get('/Request/movie') || [];
    } catch (e) {
      this.logger.error('Failed to get Ombi movie requests:', e.message);
      return [];
    }
  }

  async getTvRequests(): Promise<OmbiTvResponse[]> {
    try {
      if (!this.api) await this.init();
      return await this.api.get('/Request/tv') || [];
    } catch (e) {
      this.logger.error('Failed to get Ombi TV requests:', e.message);
      return [];
    }
  }

  async getUsers(): Promise<OmbiUser[]> {
    try {
      if (!this.api) await this.init();
      return await this.api.get('/Identity/Users') || [];
    } catch (e) {
      this.logger.error('Failed to get Ombi users:', e.message);
      return [];
    }
  }

  async getMovie(tmdbId: string): Promise<OmbiSearchMovieResponse | null> {
    try {
      if (!this.api) await this.init();
      const response: OmbiSearchMovieResponse = await this.api.get(`/v2/Search/movie/${tmdbId}`);
      return response || null;
    } catch (e) {
      this.logger.error(`Failed to get Ombi movie ${tmdbId}:`, e.message);
      return null;
    }
  }

  async getShow(tmdbId: string): Promise<OmbiSearchTvResponse | null> {
    try {
      if (!this.api) await this.init();
      const response: OmbiSearchTvResponse = await this.api.get(`/v2/Search/tv/moviedb/${tmdbId}`);
      return response || null;
    } catch (e) {
      this.logger.error(`Failed to get Ombi show ${tmdbId}:`, e.message);
      return null;
    }
  }

  async getShowByTvdbId(tvdbId: string): Promise<OmbiSearchTvResponse | null> {
    try {
      if (!this.api) await this.init();
      const response: OmbiSearchTvResponse = await this.api.get(`/v2/Search/tv/${tvdbId}`);
      return response || null;
    } catch (e) {
      this.logger.error(`Failed to get Ombi show by TVDB ID ${tvdbId}:`, e.message);
      return null;
    }
  }
}