import { ExternalApiService } from '../../external-api/external-api.service';

export class InternalApi extends ExternalApiService {
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });
  }
}
