import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SettingsService } from '../../../settings/settings.service';
import { MaintainerrLogger } from '../../../logging/logs.service';
import { BasicResponseDto } from '../../external-api/dto/basic-response.dto';

@Injectable()
export class OmbiApi {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly logger: MaintainerrLogger,
  ) {
    this.logger.setContext(OmbiApi.name);
  }

  private async getApiClient(): Promise<AxiosInstance> {
    const settings = await this.settingsService.getSettings();
    
    if (settings instanceof BasicResponseDto || !settings.ombi_url || !settings.ombi_api_key) {
      throw new Error('Ombi is not configured');
    }

    return axios.create({
      baseURL: `${settings.ombi_url}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        ApiKey: settings.ombi_api_key,
      },
      timeout: 10000,
    });
  }

  async testConnection(): Promise<BasicResponseDto> {
    try {
      const apiClient = await this.getApiClient();
      const response = await apiClient.get('/Status');
      
      if (response.status === 200 && response.data) {
        return {
          status: 'OK',
          code: 1,
          message: response.data.version || 'Connected successfully',
        };
      }
      
      return {
        status: 'NOK',
        code: 0,
        message: 'Failed to connect to Ombi',
      };
    } catch (error) {
      this.logger.error('Ombi connection test failed:', error.message);
      return {
        status: 'NOK',
        code: 0,
        message: error.message || 'Connection failed',
      };
    }
  }

  async getStatus() {
    try {
      const apiClient = await this.getApiClient();
      const response = await apiClient.get('/Status');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Ombi status:', error.message);
      throw error;
    }
  }

  async getMovieRequests() {
    try {
      const apiClient = await this.getApiClient();
      const response = await apiClient.get('/Request/movie');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Ombi movie requests:', error.message);
      throw error;
    }
  }

  async getTvRequests() {
    try {
      const apiClient = await this.getApiClient();
      const response = await apiClient.get('/Request/tv');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Ombi TV requests:', error.message);
      throw error;
    }
  }

  async getUsers() {
    try {
      const apiClient = await this.getApiClient();
      const response = await apiClient.get('/Identity/Users');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Ombi users:', error.message);
      throw error;
    }
  }
}