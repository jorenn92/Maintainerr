import { ExternalApiService } from '../../external-api/external-api.service';
import cacheManager from '../../lib/cache';
import { Logger } from '@nestjs/common';

export class OverseerrApi extends ExternalApiService {
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super(
      url,
      {
        // apikey: apiKey,
      },
      {
        headers: {
          'X-Api-Key': apiKey,
        },
        nodeCache: cacheManager.getCache('overseerr').data,
      },
    );

    this.logger = new Logger(OverseerrApi.name);
  }
}
