import { ExternalApiService } from '../../external-api/external-api.service';
import cacheManager from '../../lib/cache';

export class TautulliApi extends ExternalApiService {
  constructor({
    url,
    apiKey,
  }: {
    url: string;
    apiKey: string;
  }) {
    super(
      url,
      {
        apikey: apiKey,
      },
      {
        nodeCache: cacheManager.getCache('tautulli').data,
      },
    );
  }
}
