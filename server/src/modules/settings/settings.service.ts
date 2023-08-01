import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { BasicResponseDto } from '../api/external-api/dto/basic-response.dto';
import { OverseerrApiService } from '../api/overseerr-api/overseerr-api.service';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { ServarrService } from '../api/servarr-api/servarr.service';
import { SettingDto } from "./dto's/setting.dto";
import { Settings } from './entities/settings.entities';

@Injectable()
export class SettingsService implements SettingDto {
  private readonly logger = new Logger(SettingsService.name);
  id: number;

  clientId: string;

  applicationTitle: string;

  applicationUrl: string;

  apikey: string;

  locale: string;

  cacheImages: number;

  plex_name: string;

  plex_hostname: string;

  plex_port: number;

  plex_ssl: number;

  plex_auth_token: string;

  overseerr_url: string;

  overseerr_api_key: string;

  radarr_url: string;

  radarr_api_key: string;

  sonarr_url: string;

  sonarr_api_key: string;

  collection_handler_job_cron: string;

  rules_handler_job_cron: string;

  constructor(
    @Inject(forwardRef(() => PlexApiService))
    private readonly plexApi: PlexApiService,
    @Inject(forwardRef(() => ServarrService))
    private readonly servarr: ServarrService,
    @Inject(forwardRef(() => OverseerrApiService))
    private readonly overseerr: OverseerrApiService,
    @InjectRepository(Settings)
    private readonly settingsRepo: Repository<Settings>,
  ) {}

  public async init() {
    const settingsDb = await this.settingsRepo.findOne({ cache: false });
    if (settingsDb) {
      this.id = settingsDb?.id;
      this.clientId = settingsDb?.clientId;
      this.applicationTitle = settingsDb?.applicationTitle;
      this.applicationUrl = settingsDb?.applicationUrl;
      this.apikey = settingsDb?.apikey;
      this.locale = settingsDb?.locale;
      this.cacheImages = settingsDb?.cacheImages;
      this.plex_name = settingsDb?.plex_name;
      this.plex_hostname = settingsDb?.plex_hostname;
      this.plex_port = settingsDb?.plex_port;
      this.plex_ssl = settingsDb?.plex_ssl;
      this.plex_auth_token = settingsDb?.plex_auth_token;
      this.overseerr_url = settingsDb?.overseerr_url;
      this.overseerr_api_key = settingsDb?.overseerr_api_key;
      this.radarr_url = settingsDb?.radarr_url;
      this.radarr_api_key = settingsDb?.radarr_api_key;
      this.sonarr_url = settingsDb?.sonarr_url;
      this.sonarr_api_key = settingsDb?.sonarr_api_key;
      this.collection_handler_job_cron =
        settingsDb?.collection_handler_job_cron;
      this.rules_handler_job_cron = settingsDb?.rules_handler_job_cron;
    } else {
      this.logger.log('Settings not found.. Creating initial settings');
      await this.settingsRepo.insert({
        apikey: this.generateApiKey(),
      });
      this.init();
    }
  }

  public async getSettings() {
    try {
      return this.settingsRepo.findOne({});
    } catch (err) {
      this.logger.error(
        'Something went wrong while getting settings. Is the database file locked?',
      );
      return { status: 'NOK', code: 0, message: err } as BasicResponseDto;
    }
  }

  public async deletePlexApiAuth(): Promise<BasicResponseDto> {
    try {
      await this.settingsRepo.update({}, { plex_auth_token: undefined });
      return { status: 'OK', code: 1, message: 'Success' };
    } catch (err) {
      this.logger.error(
        'Something went wrong while deleting the Plex auth token',
      );
      return { status: 'NOK', code: 0, message: err };
    }
  }

  public async updateSettings(settings: Settings): Promise<BasicResponseDto> {
    try {
      const settingsDb = await this.settingsRepo.findOne({});

      // Plex SSL specifics
      settings.plex_ssl =
        settings.plex_hostname.includes('https://') || settings.plex_port == 443
          ? 1
          : 0;
      settings.plex_hostname = settings.plex_hostname
        .replace('https://', '')
        .replace('http://', '');

      await this.settingsRepo.save({
        ...settingsDb,
        ...settings,
      });
      await this.init();
      this.logger.log('Settings updated');
      this.plexApi.initialize({});
      this.servarr.init();
      this.overseerr.init();
      return { status: 'OK', code: 1, message: 'Success' };
    } catch (e) {
      this.logger.error('Something went wrong while updating settings');
      return { status: 'NOK', code: 0, message: 'Failure' };
    }
  }

  public generateApiKey(): string {
    return Buffer.from(`Maintainerr${Date.now()}${randomUUID()})`).toString(
      'base64',
    );
  }

  public async testOverseerr(): Promise<BasicResponseDto> {
    try {
      const resp = await this.overseerr.status();
      return resp !== null && resp.version !== undefined
        ? { status: 'OK', code: 1, message: resp.version }
        : { status: 'NOK', code: 0, message: 'Failure' };
    } catch {
      return { status: 'NOK', code: 0, message: 'Failure' };
    }
  }

  public async testRadarr(): Promise<BasicResponseDto> {
    try {
      const resp = await this.servarr.RadarrApi.info();
      return resp !== null && resp.version !== undefined
        ? { status: 'OK', code: 1, message: resp.version }
        : { status: 'NOK', code: 0, message: 'Failure' };
    } catch {
      return { status: 'NOK', code: 0, message: 'Failure' };
    }
  }

  public async testSonarr(): Promise<BasicResponseDto> {
    try {
      const resp = await this.servarr.SonarrApi.info();
      return resp !== null && resp.version !== undefined
        ? { status: 'OK', code: 1, message: resp.version }
        : { status: 'NOK', code: 0, message: 'Failure' };
    } catch {
      return { status: 'NOK', code: 0, message: 'Failure' };
    }
  }

  public async testPlex(): Promise<any> {
    try {
      const resp = await this.plexApi.getStatus();
      return resp !== null && resp.version !== undefined
        ? { status: 'OK', code: 1, message: resp.version }
        : { status: 'NOK', code: 0, message: 'Failure' };
    } catch {
      return { status: 'NOK', code: 0, message: 'Failure' };
    }
  }

  // Test if all configured applications are reachable. Plex is required.
  public async testConnections(): Promise<boolean> {
    try {
      const plexState = (await this.testPlex()).status === 'OK';
      let radarrState = true;
      let sonarrState = true;
      let overseerrState = true;
      if (this.radarr_url && this.radarr_api_key) {
        radarrState = (await this.testRadarr()).status === 'OK';
      }

      if (this.sonarr_url && this.sonarr_api_key) {
        sonarrState = (await this.testSonarr()).status === 'OK';
      }

      if (this.overseerr_url && this.overseerr_api_key) {
        overseerrState = (await this.testOverseerr()).status === 'OK';
      }

      if (plexState && radarrState && sonarrState && overseerrState) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }

  // Test if all required settings are set.
  public async testSetup(): Promise<boolean> {
    try {
      if (
        this.plex_hostname &&
        this.plex_name &&
        this.plex_port &&
        this.plex_auth_token
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public appVersion(): string {
    return process.env.npm_package_version
      ? process.env.npm_package_version
      : '0.0.0';
  }
}
