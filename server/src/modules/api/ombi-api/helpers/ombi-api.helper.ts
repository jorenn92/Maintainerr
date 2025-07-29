import { MaintainerrLogger } from '../../../logging/logs.service';
import { ExternalApiService } from '../../external-api/external-api.service';
import cacheManager from '../../lib/cache';

export class OmbiApi extends ExternalApiService {
  constructor(
    {
      url,
      apiKey,
    }: {
      url: string;
      apiKey: string;
    },
    protected readonly logger: MaintainerrLogger,
  ) {
    logger.setContext(OmbiApi.name);
    super(`${url}/api`, {}, logger, {
      headers: {
        ApiKey: apiKey,
      },
      nodeCache: cacheManager.getCache('ombi').data,
    });
  }
}