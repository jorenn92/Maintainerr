import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SettingsService } from 'src/modules/settings/settings.service';
import { RadarrApi } from './helpers/radarr.helper';
import { SonarrApi } from './helpers/sonarr.helper';

@Injectable()
export class ServarrService {
  RadarrApi: RadarrApi;
  SonarrApi: SonarrApi;
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {}

  public async init() {
    this.RadarrApi = new RadarrApi({
      url: `${this.settings.radarr_url}/api/v3/`,
      apiKey: `${this.settings.radarr_api_key}`,
    });
    this.SonarrApi = new SonarrApi({
      url: `${this.settings.sonarr_url}/api/v3/`,
      apiKey: `${this.settings.sonarr_api_key}`,
    });
  }
}
