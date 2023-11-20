import NodePlexAPI from 'plex-api';
import cacheManager, { Cache } from './cache';
import { AxiosHeaderValue } from 'axios';

// NodePlexApi wrapped with a cache
class PlexApi extends NodePlexAPI {
  public cache: Cache;
  public authToken: any | AxiosHeaderValue;

  constructor(options) {
    super(options);
    this.cache = cacheManager.getCache('plexguid');
  }

  async query<T>(options): Promise<T> {
    return this.queryWithCache(options, true);
  }

  async queryWithCache<T>(options, doCache: boolean): Promise<T> {
    if (typeof options === 'string') {
      options = {
        uri: options,
      };
    }
    try {
      const cacheKey = this.serializeCacheKey(options);
      const cachedItem = this.cache.data.get<T>(cacheKey);

      if (cachedItem && doCache) {
        return cachedItem;
      } else {
        const response = await super.query<T>(options);
        if (doCache) this.cache.data.set(cacheKey, response);
        return response;
      }
    } catch (err) {
      return undefined;
    }
  }

  deleteQuery<T>(arg) {
    return super.deleteQuery(arg);
  }
  postQuery<T>(arg) {
    return super.postQuery(arg);
  }
  putQuery<T>(arg) {
    return super.putQuery(arg);
  }

  private serializeCacheKey(params: Record<string, unknown>) {
    try {
      return `${JSON.stringify(params)}`;
    } catch (err) {
      return undefined;
    }
  }
}

export default PlexApi;
