import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { QbittorrentApi } from './helpers/qbittorrent-api.helpers';

@Injectable()
export class QbittorrentApiService {
  private api: QbittorrentApi;
  private readonly logger = new Logger(QbittorrentApiService.name);

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {
    this.initialize();
  }

  public async initialize() {
    try {
      const url = this.settings.qbittorrent_url;
      const username = this.settings.qbittorrent_username;
      const password = this.settings.qbittorrent_password;
      if (url && username && password) {
        this.api = new QbittorrentApi({ url, username, password });
      } else {
        this.logger.log(
          "QBitTorrent API isn't fully initialized, required settings aren't set",
        );
      }
    } catch (err) {
      this.logger.warn(
        `Couldn't connect to QBitTorrent.. Please check your settings`,
      );
      this.logger.debug(err);
    }
  }

  public async getStatus() {
    try {
      const response: string = await this.api.get('/api/v2/app/version');
      return response;
    } catch (err) {
      this.logger.warn(
        'QBitTorrent api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }
}
