import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../../modules/settings/settings.service';
import { InternalApi } from './helpers/internal-api.helper';

@Injectable()
export class InternalApiService {
  private api: InternalApi;

  private readonly logger = new Logger(InternalApiService.name);
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {}

  public async init() {
    const apiPort = process.env.API_PORT;

    this.api = new InternalApi({
      url: `http://localhost:${apiPort}/api/`,
      apiKey: `${this.settings.apikey}`,
    });
  }

  public getApi() {
    return this.api;
  }
}
