import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SettingsService } from '../../../modules/settings/settings.service';
import { RadarrSettingRawDto } from "../../settings/dto's/radarr-setting.dto";
import { SonarrSettingRawDto } from "../../settings/dto's/sonarr-setting.dto";
import cacheManager from '../lib/cache';
import { RadarrApi } from './helpers/radarr.helper';
import { SonarrApi } from './helpers/sonarr.helper';

@Injectable()
export class ServarrService {
  SonarrApi: SonarrApi;
  private radarrApiCache: Record<string, RadarrApi> = {};
  private sonarrApiCache: Record<string, SonarrApi> = {};

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {}

  public async getSonarrApiClient(id: number | SonarrSettingRawDto) {
    if (typeof id === 'object') {
      return new SonarrApi({
        url: `${id.url}/api/v3/`,
        apiKey: `${id.apiKey}`,
      });
    } else {
      if (!this.sonarrApiCache[id]) {
        const setting = await this.settings.getSonarrSetting(id);

        if (setting == null || !('id' in setting)) {
          throw new Error('Sonarr setting not found');
        }

        const cacheKey = `sonarr-${id}`;
        if (!cacheManager.getAnonymousCache(cacheKey)) {
          cacheManager.createCache(cacheKey, `Sonarr-${id}`, 'sonarr');
        }

        this.sonarrApiCache[id] = new SonarrApi({
          url: `${setting.url}/api/v3/`,
          apiKey: `${setting.apiKey}`,
          cacheName: cacheKey,
        });
      }

      return this.sonarrApiCache[id];
    }
  }

  public async getRadarrApiClient(id: number | RadarrSettingRawDto) {
    if (typeof id === 'object') {
      return new RadarrApi({
        url: `${id.url}/api/v3/`,
        apiKey: `${id.apiKey}`,
      });
    } else {
      if (!this.radarrApiCache[id]) {
        const setting = await this.settings.getRadarrSetting(id);

        if (setting == null || !('id' in setting)) {
          throw new Error('Radarr setting not found');
        }

        const cacheKey = `radarr-${id}`;
        if (!cacheManager.getAnonymousCache(cacheKey)) {
          cacheManager.createCache(cacheKey, `Radarr-${id}`, 'radarr');
        }

        this.radarrApiCache[id] = new RadarrApi({
          url: `${setting.url}/api/v3/`,
          apiKey: `${setting.apiKey}`,
          cacheName: cacheKey,
        });
      }

      return this.radarrApiCache[id];
    }
  }

  public deleteCachedRadarrApiClient(id: number) {
    if (this.radarrApiCache[id]) {
      delete this.radarrApiCache[id];
    }
  }

  public deleteCachedSonarrApiClient(id: number) {
    if (this.sonarrApiCache[id]) {
      delete this.sonarrApiCache[id];
    }
  }
}
