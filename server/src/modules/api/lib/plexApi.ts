import NodePlexAPI from 'plex-api';
import cacheManager, { Cache } from './cache';
import { AxiosHeaderValue } from 'axios';
import { PlexLibraryResponse } from '../plex-api/interfaces/library.interfaces';

// NodePlexApi wrapped with a cache
class PlexApi extends NodePlexAPI {
  public cache: Cache;
  public authToken: any | AxiosHeaderValue;

  constructor(options) {
    super(options);
    this.cache = cacheManager.getCache('plexguid');
  }

  async query<T>(options, docache: boolean = true): Promise<T> {
    return this.queryWithCache(options, docache);
  }

  /**
   * Queries all items with the given options, will fetch all pages.
   *
   * @param {any} options - The options for the query.
   * @return {Promise<T[]>} - A promise that resolves to an array of T.
   */
  async queryAll<T>(options): Promise<T> {
    // vars
    let result = undefined;
    let next = true;
    let page = 0;
    const size = 120;
    options = {
      ...options,
      extraHeaders: {
        ...options?.extraHeaders,
        'X-Plex-Container-Start': `${page}`,
        'X-Plex-Container-Size': `${size}`,
      },
    };

    // loop responses
    while (next) {
      const query: PlexLibraryResponse = await this.queryWithCache(
        options,
        true,
      );
      if (result === undefined) {
        // if first response, replace result
        result = query;
      } else {
        // if next response, add to previous result
        const items = this.getDataValue(query.MediaContainer);

        // if response is an array
        if (items) {
          this.appendToData(result.MediaContainer, items as any[]);
        }
      }

      // fetch all if more than 120
      if (query?.MediaContainer?.totalSize > size * (page + 1)) {
        options.extraHeaders['X-Plex-Container-Start'] = `${size * (page + 1)}`;
        page++;
      } else {
        next = false;
      }
    }
    return result as unknown as T;
  }

  async queryWithCache<T>(options, doCache: boolean = true): Promise<T> {
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

  /**
   * Retrieves the first array value from an object.
   *
   * @param {Record<string, T>} obj - The object to retrieve the value from.
   * @returns {T | undefined} - The first array value found in the object, or undefined if no array value is found.
   */
  private getDataValue<T>(obj: Record<string, T>): T | undefined {
    const keys = Object.keys(obj);

    // Find the first key that has an array value
    const arrayKey = keys.find((key) => Array.isArray(obj[key]));

    // If a key with an array value is found, return the corresponding value
    if (arrayKey !== undefined) {
      return obj[arrayKey];
    } else {
      return undefined; // No key with an array value found
    }
  }

  /**
   * Appends an array of items to the first array property in a given object.
   *
   * @param {Record<string, T>} obj - The object to append the items to.
   * @param {T[]} newItem - The items to append to the object.
   * @returns {Record<string, T>} - The object with the items appended to the specified property.
   */
  private appendToData<T>(
    obj: Record<string, T>,
    newItem: T[],
  ): Record<string, T> {
    const keys = Object.keys(obj);

    // Find the first key that has an array value
    const arrayKey = keys.find((key) => Array.isArray(obj[key]));

    if (arrayKey !== undefined) {
      const arrayValue = obj[arrayKey];

      // Ensure that the value is an array
      if (Array.isArray(arrayValue)) {
        // If it's an array, append the new item
        obj[arrayKey] = [...arrayValue, ...newItem] as T;
      }
    }
    return obj;
  }
}

export default PlexApi;
