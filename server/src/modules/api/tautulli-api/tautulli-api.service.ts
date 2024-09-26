import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../..//modules/settings/settings.service';
import { TautulliApi } from './helpers/tautulli-api.helper';
import _ from 'lodash';

interface TautulliInfo {
  machine_identifier: string;
  version: string;
}

export interface TautulliUser {
  user_id: number;
  username: string;
}

export interface TautulliMetadata {
  media_type:
    | 'season'
    | 'episode'
    | 'movie'
    | 'track'
    | 'album'
    | 'artist'
    | 'show';
  rating_key: string;
  parent_rating_key: string;
  grandparent_rating_key: string;
  added_at: string;
}

interface TautulliChildrenMetadata {
  children_count: number;
  children_list: TautulliMetadata[];
}

interface TautulliHistory {
  recordsFiltered: number;
  recordsTotal: number;
  data: TautulliHistoryItem[];
  draw: number;
  filter_duration: string;
  total_duration: string;
}

interface TautulliHistoryItem {
  user_id: number;
  user: string;
  watched_status: number;
  stopped: number;
  rating_key: number;
  media_index: number;
  parent_media_index: number;
}

export interface TautulliHistoryRequestOptions {
  grouping?: 0 | 1;
  include_activity?: 0 | 1;
  user?: string;
  user_id?: number;
  rating_key?: number | string;
  parent_rating_key?: number | string;
  grandparent_rating_key?: number | string;
  start_date?: string;
  before?: string;
  after?: string;
  section_id?: number;
  media_type?: 'movie' | 'episode' | 'track' | 'live';
  transcode_decision?: 'direct play' | 'transcode' | 'copy';
  guid?: string;
  order_column?: string;
  order_dir?: 'desc' | 'asc';
  start?: number;
  length?: number;
  search?: string;
}

interface TautulliItemWatchTimeStatsRequestOptions {
  grouping?: 0 | 1;
  rating_key: number | string;
}

interface TautulliItemWatchTimeStats {
  query_days: 1 | 7 | 30 | 0;
  total_time: number;
  total_plays: number;
}

interface Response<T> {
  response:
    | {
        message: string | null;
        result: 'success';
        data: T;
      }
    | {
        message: string | null;
        result: 'error';
        data: {};
      };
}

const MAX_PAGE_SIZE = 100;

@Injectable()
export class TautulliApiService {
  api: TautulliApi;

  private readonly logger = new Logger(TautulliApiService.name);
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {}

  public async init() {
    this.api = new TautulliApi({
      url: `${this.settings.tautulli_url}api/v2`,
      apiKey: `${this.settings.tautulli_api_key}`,
    });
  }

  public async info(): Promise<Response<TautulliInfo> | null> {
    try {
      const response: Response<TautulliInfo> = await this.api.getWithoutCache(
        '',
        {
          signal: AbortSignal.timeout(10000),
          params: {
            cmd: 'get_server_identity',
          },
        },
      );
      return response;
    } catch (e) {
      this.logger.log("Couldn't fetch Tautulli info!", {
        label: 'Tautulli API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async getPaginatedHistory(
    options?: TautulliHistoryRequestOptions,
  ): Promise<TautulliHistory | null> {
    try {
      options.length = options.length ? options.length : MAX_PAGE_SIZE;
      options.start = options.start || options.start === 0 ? options.start : 0;

      const response: Response<TautulliHistory> = await this.api.get('', {
        params: {
          cmd: 'get_history',
          ...options,
        },
      });

      if (response.response.result !== 'success') {
        throw new Error(
          'Non-success response when fetching Tautulli paginated history',
        );
      }

      return response.response.data;
    } catch (e) {
      this.logger.log("Couldn't fetch Tautulli paginated history!", {
        label: 'Tautulli API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async getHistory(
    options?: Omit<TautulliHistoryRequestOptions, 'length' | 'start'>,
  ): Promise<TautulliHistoryItem[] | null> {
    try {
      const newOptions: TautulliHistoryRequestOptions = {
        ...options,
        length: MAX_PAGE_SIZE,
        start: 0,
      };

      let data = await this.getPaginatedHistory(newOptions);
      const pageSize: number = MAX_PAGE_SIZE;

      const totalCount: number =
        data && data && data.recordsFiltered ? data.recordsFiltered : 0;
      const pageCount: number = Math.ceil(totalCount / pageSize);
      let currentPage = 1;

      let results: TautulliHistoryItem[] = [];
      results = _.unionBy(
        results,
        data && data.data && data.data && data.data.length ? data.data : [],
        'id',
      );

      if (results.length < totalCount) {
        while (currentPage < pageCount) {
          newOptions.start = currentPage * pageSize;
          data = await this.getPaginatedHistory(newOptions);

          currentPage++;

          results = _.unionBy(
            results,
            data && data.data && data.data && data.data.length ? data.data : [],
            'id',
          );

          if (results.length === totalCount) {
            break;
          }
        }
      }

      return results;
    } catch (e) {
      this.logger.log("Couldn't fetch Tautulli history!", {
        label: 'Tautulli API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async getMetadata(
    ratingKey: number | string,
  ): Promise<TautulliMetadata | null> {
    try {
      const response: Response<TautulliMetadata> = await this.api.get('', {
        params: {
          cmd: 'get_metadata',
          rating_key: ratingKey,
        },
      });

      if (response.response.result !== 'success') {
        throw new Error('Non-success response when fetching Tautulli metadata');
      }

      return response.response.data;
    } catch (e) {
      this.logger.log("Couldn't fetch Tautulli metadata!", {
        label: 'Tautulli API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async getChildrenMetadata(
    ratingKey: number | string,
  ): Promise<TautulliMetadata[] | null> {
    try {
      const response: Response<TautulliChildrenMetadata> = await this.api.get(
        '',
        {
          params: {
            cmd: 'get_children_metadata',
            rating_key: ratingKey,
          },
        },
      );

      if (response.response.result !== 'success') {
        throw new Error(
          'Non-success response when fetching Tautulli children metadata',
        );
      }

      return response.response.data.children_list;
    } catch (e) {
      this.logger.log("Couldn't fetch Tautulli children metadata!", {
        label: 'Tautulli API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async getItemWatchTimeStats(
    options: TautulliItemWatchTimeStatsRequestOptions,
  ): Promise<TautulliItemWatchTimeStats[] | null> {
    try {
      const response: Response<TautulliItemWatchTimeStats[]> =
        await this.api.get('', {
          params: {
            cmd: 'get_item_watch_time_stats',
            ...options,
          },
        });

      if (response.response.result !== 'success') {
        throw new Error(
          'Non-success response when fetching Tautulli item watch time stats',
        );
      }

      return response.response.data;
    } catch (e) {
      this.logger.log("Couldn't fetch Tautulli item watch time stats!", {
        label: 'Tautulli API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }

  public async getUsers(): Promise<TautulliUser[] | null> {
    try {
      const response: Response<TautulliUser[]> = await this.api.get('', {
        params: {
          cmd: 'get_users',
        },
      });

      if (response.response.result !== 'success') {
        throw new Error('Non-success response when fetching Tautulli users');
      }

      return response.response.data;
    } catch (e) {
      this.logger.log("Couldn't fetch Tautulli users!", {
        label: 'Tautulli API',
        errorMessage: e.message,
      });
      this.logger.debug(e);
      return null;
    }
  }
}
