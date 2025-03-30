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
    this.init();
  }

  public async init() {
    try {
      const url = this.settings.qbittorrent_url;
      if (url) {
        this.api = new QbittorrentApi({ url });
        this.login();
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

  public async login() {
    const username = this.settings.qbittorrent_username;
    const password = this.settings.qbittorrent_password;
    if (username && password) {
      await this.api.post(
        '/api/v2/auth/login',
        {
          username,
          password,
        },
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        },
      );
    } else {
      this.logger.log(
        "QBitTorrent API no username or password, required settings aren't set",
      );
    }
  }

  public async getStatus() {
    try {
      let response: string = await this.api.get('/api/v2/app/version');
      if (!response) {
        await this.login();
        response = await this.api.get('/api/v2/app/version');
      }
      return response;
    } catch (err) {
      this.logger.warn(
        'QBitTorrent api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }

  public async delete(downloadId: string) {
    try {
      const response = await this.api.post(
        `/api/v2/torrents/delete`,
        `hashes=${downloadId.toLowerCase()}&deleteFiles=true`,
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        },
      );
      if (!response) {
        await this.login();
        await this.api.post(
          `/api/v2/torrents/delete`,
          `hashes=${downloadId.toLowerCase()}&deleteFiles=true`,
          {
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
          },
        );
      }
      this.logger.debug(`Delete downloadId ${downloadId} from Qbittorrent`);
    } catch (err) {
      this.logger.warn(
        'QBitTorrent api communication failure.. Is the application running?',
      );
      this.logger.debug(err);
      return undefined;
    }
  }
}
