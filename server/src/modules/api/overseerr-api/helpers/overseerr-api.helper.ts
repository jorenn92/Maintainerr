import { ExternalApiService } from '../../external-api/external-api.service';
import cacheManager, { AvailableCacheIds } from '../../lib/cache';

export class OverseerrApi extends ExternalApiService {
  constructor({
    url,
    apiKey,
    cacheName,
  }: {
    url: string;
    apiKey: string;
    cacheName: AvailableCacheIds;
  }) {
    super(
      url,
      {
        // apikey: apiKey,
      },
      {
        headers: {
          'X-Api-Key': apiKey,
        },
        nodeCache: cacheManager.getCache(cacheName).data,
      },
    );
  }
}
