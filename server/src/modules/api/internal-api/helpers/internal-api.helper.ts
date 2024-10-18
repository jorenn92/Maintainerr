import { ExternalApiService } from '../../external-api/external-api.service';
import { Logger } from '@nestjs/common';

export class InternalApi extends ExternalApiService {
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    this.logger = new Logger(InternalApi.name);
  }
}
