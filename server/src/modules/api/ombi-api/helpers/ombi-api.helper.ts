import { ExternalApiService } from '../../external-api/external-api.service';
import cacheManager, { AvailableCacheIds } from '../../lib/cache';

export class OmbiApi extends ExternalApiService {
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
      {},
      {
        headers: {
          ApiKey: apiKey,
        },
        nodeCache: cacheManager.getCache(cacheName).data,
      },
    );
  }
}
