import { Logger } from '@nestjs/common';
import { ExternalApiService } from '../../external-api/external-api.service';

export class QbittorrentApi extends ExternalApiService {
  token: string;
  constructor({
    url,
    username,
    password,
  }: {
    url: string;
    username: string;
    password: string;
  }) {
    super(url, {}, {}, true);
    this.logger = new Logger(QbittorrentApi.name);
    this.post(
      '/api/v2/auth/login',
      {
        username,
        password,
      },
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      },
    );
  }
}
