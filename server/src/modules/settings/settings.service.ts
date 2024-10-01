import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { isValidCron } from 'cron-validator';
import { BasicResponseDto } from '../api/external-api/dto/basic-response.dto';
import { OverseerrApiService } from '../api/overseerr-api/overseerr-api.service';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { ServarrService } from '../api/servarr-api/servarr.service';
import { SettingDto } from "./dto's/setting.dto";
import { Settings } from './entities/settings.entities';
import { InternalApiService } from '../api/internal-api/internal-api.service';
import { TautulliApiService } from '../api/tautulli-api/tautulli-api.service';
import { NotificationSettings } from './interfaces/notifications-settings.interface';
import { NotificationService } from '../notifications/notifications.service';

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

  tautulli_url: string;

  tautulli_api_key: string;

  notification_settings: NotificationSettings;

  collection_handler_job_cron: string;

  rules_handler_job_cron: string;

  constructor(
    @Inject(forwardRef(() => PlexApiService))
    private readonly plexApi: PlexApiService,
    @Inject(forwardRef(() => ServarrService))
    private readonly servarr: ServarrService,
    @Inject(forwardRef(() => OverseerrApiService))
    private readonly overseerr: OverseerrApiService,
    @Inject(forwardRef(() => TautulliApiService))
    private readonly tautulli: TautulliApiService,
    @Inject(forwardRef(() => InternalApiService))
    private readonly internalApi: InternalApiService,
    @InjectRepository(Settings)
    private readonly settingsRepo: Repository<Settings>,
  ) {}

  public async init() {
    const settingsDb = await this.settingsRepo.findOne({
      where: {},
    });
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
      this.tautulli_url = settingsDb?.tautulli_url;
      this.tautulli_api_key = settingsDb?.tautulli_api_key;
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
      return this.settingsRepo.findOne({ where: {} });
    } catch (err) {
      this.logger.error(
        'Something went wrong while getting settings. Is the database file locked?',
      );
      return { status: 'NOK', code: 0, message: err } as BasicResponseDto;
    }
  }

  public async deletePlexApiAuth(): Promise<BasicResponseDto> {
    try {
      await this.settingsRepo.update({}, { plex_auth_token: null });
      return { status: 'OK', code: 1, message: 'Success' };
    } catch (err) {
      this.logger.error(
        'Something went wrong while deleting the Plex auth token',
      );
      return { status: 'NOK', code: 0, message: err };
    }
  }

  public async savePlexApiAuthToken(plex_auth_token: string) {
    try {
      const settingsDb = await this.settingsRepo.findOne({ where: {} });

      await this.settingsRepo.save({
        ...settingsDb,
        plex_auth_token: plex_auth_token,
      });

      return { status: 'OK', code: 1, message: 'Success' };
    } catch (e) {
      this.logger.error('Error while updating Plex auth token: ', e);
      return { status: 'NOK', code: 0, message: 'Failed' };
    }
  }

  public async updateSettings(settings: Settings): Promise<BasicResponseDto> {
    try {
      settings.plex_hostname = settings.plex_hostname?.toLowerCase();
      settings.radarr_url = settings.radarr_url?.toLowerCase();
      settings.sonarr_url = settings.sonarr_url?.toLowerCase();
      settings.overseerr_url = settings.overseerr_url?.toLowerCase();
      settings.tautulli_url = settings.tautulli_url?.toLowerCase();

      const settingsDb = await this.settingsRepo.findOne({ where: {} });
      // Plex SSL specifics

      settings.plex_ssl =
        settings.plex_hostname?.includes('https://') ||
        settings.plex_port == 443
          ? 1
          : 0;
      settings.plex_hostname = settings.plex_hostname
        ?.replace('https://', '')
        ?.replace('http://', '');

      if (
        this.cronIsValid(settings.collection_handler_job_cron) &&
        this.cronIsValid(settings.rules_handler_job_cron)
      ) {
        await this.settingsRepo.save({
          ...settingsDb,
          ...settings,
        });
        await this.init();
        this.logger.log('Settings updated');
        this.plexApi.initialize({});
        this.servarr.init();
        this.overseerr.init();
        this.tautulli.init();
        this.internalApi.init();

        // reload Rule handler job if changed
        if (
          settingsDb.rules_handler_job_cron !== settings.rules_handler_job_cron
        ) {
          this.logger.log(
            `Rule Handler cron schedule changed.. Reloading job.`,
          );
          this.internalApi
            .getApi()
            .put(
              '/rules/schedule/update',
              `{"schedule": "${settings.rules_handler_job_cron}"}`,
            );
        }

        // reload Collection handler job if changed
        if (
          settingsDb.collection_handler_job_cron !==
          settings.collection_handler_job_cron
        ) {
          this.logger.log(
            `Collection Handler cron schedule changed.. Reloading job.`,
          );
          this.internalApi
            .getApi()
            .put(
              '/collections/schedule/update',
              `{"schedule": "${settings.collection_handler_job_cron}"}`,
            );
        }

        return { status: 'OK', code: 1, message: 'Success' };
      } else {
        this.logger.error(
          'Invalid CRON configuration found, settings update aborted.',
        );
        return {
          status: 'NOK',
          code: 0,
          message: 'Update failed, invalid CRON value was found',
        };
      }
    } catch (e) {
      this.logger.error('Error while updating settings: ', e);
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

  public async testTautulli(): Promise<BasicResponseDto> {
    try {
      const resp = await this.tautulli.info();
      return resp?.response && resp?.response.result == 'success'
        ? {
            status: 'OK',
            code: 1,
            message: resp.response.data?.tautulli_version,
          }
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
    } catch (e) {
      this.logger.debug(e);

      return { status: 'NOK', code: 0, message: 'Failure' };
    }
  }

  public async testPlex(): Promise<any> {
    try {
      const resp = await this.plexApi.getStatus();
      return resp !== null && resp.version !== undefined
        ? { status: 'OK', code: 1, message: resp.version }
        : { status: 'NOK', code: 0, message: 'Failure' };
    } catch (e) {
      this.logger.debug(e);
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
      let tautulliState = true;
      if (this.radarrConfigured()) {
        radarrState = (await this.testRadarr()).status === 'OK';
      }

      if (this.sonarrConfigured()) {
        sonarrState = (await this.testSonarr()).status === 'OK';
      }

      if (this.overseerrConfigured()) {
        overseerrState = (await this.testOverseerr()).status === 'OK';
      }

      if (this.tautulliConfigured()) {
        tautulliState = (await this.testTautulli()).status === 'OK';
      }

      if (
        plexState &&
        radarrState &&
        sonarrState &&
        overseerrState &&
        tautulliState
      ) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      this.logger.debug(e);
      return false;
    }
  }

  public radarrConfigured(): boolean {
    return this.radarr_url !== null && this.radarr_api_key !== null;
  }

  public sonarrConfigured(): boolean {
    return this.sonarr_url !== null && this.sonarr_api_key !== null;
  }

  public overseerrConfigured(): boolean {
    return this.overseerr_url !== null && this.overseerr_api_key !== null;
  }

  public tautulliConfigured(): boolean {
    return this.tautulli_url !== null && this.tautulli_api_key !== null;
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
    } catch (e) {
      this.logger.debug(e);
      return false;
    }
  }

  public appVersion(): string {
    return process.env.npm_package_version
      ? process.env.npm_package_version
      : '0.0.0';
  }

  public cronIsValid(schedule: string) {
    if (isValidCron(schedule)) {
      return true;
    }
    return false;
  }

  public async getPlexServers() {
    return await this.plexApi.getAvailableServers();
  }
}
