import { Logger } from '@nestjs/common';
import { ExternalApiService } from '../../external-api/external-api.service';

export class QbittorrentApi extends ExternalApiService {
  token: string;
  constructor({ url }: { url: string }) {
    super(url, {}, {}, true);
    this.logger = new Logger(QbittorrentApi.name);
  }
}
