import { ExternalApiService } from '../../external-api/external-api.service';
import cacheManager from '../../lib/cache';
import { Logger } from '@nestjs/common';

export class JellyseerrApi extends ExternalApiService {
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super(
      url,
      {},
      {
        headers: {
          'X-Api-Key': apiKey,
        },
        nodeCache: cacheManager.getCache('jellyseerr').data,
      },
    );

    this.logger = new Logger(JellyseerrApi.name);
  }
}
