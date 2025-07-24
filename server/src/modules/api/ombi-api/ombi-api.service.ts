import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { MaintainerrLogger } from '../../logging/logs.service';
import { BasicResponseDto } from '../external-api/dto/basic-response.dto';
import { OmbiApi } from './helpers/ombi-api.helper';

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

@Injectable()
export class OmbiApiService {
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
    private readonly ombiApi: OmbiApi,
    private readonly logger: MaintainerrLogger,
  ) {
    this.logger.setContext(OmbiApiService.name);
  }

  async validateApiConnectivity(): Promise<BasicResponseDto> {
    try {
      return await this.ombiApi.testConnection();
    } catch (e) {
      this.logger.error('Ombi API connectivity validation failed:', e.message);
      return { status: 'NOK', code: 0, message: e.message };
    }
  }

  async status() {
    try {
      return await this.ombiApi.getStatus();
    } catch (e) {
      this.logger.error('Failed to get Ombi status:', e.message);
      throw e;
    }
  }

  async getMovieRequests(): Promise<OmbiMovieResponse[]> {
    try {
      return await this.ombiApi.getMovieRequests();
    } catch (e) {
      this.logger.error('Failed to get Ombi movie requests:', e.message);
      return [];
    }
  }

  async getTvRequests(): Promise<OmbiTvResponse[]> {
    try {
      return await this.ombiApi.getTvRequests();
    } catch (e) {
      this.logger.error('Failed to get Ombi TV requests:', e.message);
      return [];
    }
  }

  async getUsers(): Promise<OmbiUser[]> {
    try {
      return await this.ombiApi.getUsers();
    } catch (e) {
      this.logger.error('Failed to get Ombi users:', e.message);
      return [];
    }
  }

  async getMovie(tmdbId: string): Promise<OmbiMovieResponse | null> {
    try {
      const movieRequests = await this.getMovieRequests();
      return movieRequests.find(request => 
        request.tmdbId?.toString() === tmdbId
      ) || null;
    } catch (e) {
      this.logger.error(`Failed to get Ombi movie ${tmdbId}:`, e.message);
      return null;
    }
  }

  async getShow(tmdbId: string): Promise<OmbiTvResponse | null> {
    try {
      const tvRequests = await this.getTvRequests();
      return tvRequests.find(request => 
        request.tmdbId?.toString() === tmdbId ||
        request.tvDbId?.toString() === tmdbId
      ) || null;
    } catch (e) {
      this.logger.error(`Failed to get Ombi show ${tmdbId}:`, e.message);
      return null;
    }
  }
}