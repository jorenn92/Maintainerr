import { ExternalApiService } from '../external-api/external-api.service';

export class JellyfinApi extends ExternalApiService {
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super(
      url,
      {},
      {
        headers: {
          'X-Emby-Token': apiKey,
        },
      },
    );
  }
}
