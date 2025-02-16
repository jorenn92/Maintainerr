import cacheManager, { Cache } from './cache';
import { PlexLibraryResponse } from '../plex-api/interfaces/library.interfaces';
import xml2js from 'xml2js';

type PlexApiOptions = {
  hostname: string;
  port: number;
  https?: boolean;
  token: string;
  timeout?: number;
};

type InternalRequestOptions = {
  uri: string;
  method: string;
  parseResponse?: boolean;
  extraHeaders?: Record<string, string>;
};

type RequestOptions = {
  uri: string;
  extraHeaders?: Record<string, string>;
};

class PlexApi {
  private cache: Cache;
  private options: PlexApiOptions;
  private serverUrl: string;

  constructor(options: PlexApiOptions) {
    this.options = options;
    this.serverUrl = options.hostname + ':' + this.options.port;
    this.cache = cacheManager.getCache('plexguid');
  }

  async query<T>(
    options: RequestOptions | string,
    docache: boolean = true,
  ): Promise<T> {
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

  async queryWithCache<T>(
    options: RequestOptions | string,
    doCache: boolean = true,
  ): Promise<T> {
    if (typeof options === 'string') {
      options = {
        uri: options,
      };
    }

    const cacheKey = this.serializeCacheKey(options);
    const cachedItem = this.cache.data.get<T>(cacheKey);

    if (cachedItem && doCache) {
      return cachedItem;
    } else {
      const response = await this.getQuery<T>(options);
      if (doCache) this.cache.data.set(cacheKey, response);
      return response;
    }
  }

  private getQuery<T>(options: RequestOptions) {
    const newOptions: InternalRequestOptions = {
      ...options,
      method: 'GET',
      parseResponse: true,
    };

    return this._request<T>(newOptions).then(attachUri(newOptions.uri));
  }

  deleteQuery(options: RequestOptions) {
    const newOptions: InternalRequestOptions = {
      ...options,
      method: 'DELETE',
      parseResponse: false,
    };

    return this._request(newOptions);
  }

  postQuery<T>(options: RequestOptions) {
    const newOptions: InternalRequestOptions = {
      ...options,
      method: 'POST',
      parseResponse: true,
    };

    return this._request<T>(newOptions).then(attachUri(newOptions.uri));
  }

  putQuery<T>(options: RequestOptions) {
    const newOptions = {
      ...options,
      method: 'PUT',
      parseResponse: true,
    };

    return this._request<T>(newOptions).then(attachUri(newOptions.uri));
  }

  private getServerScheme() {
    if (this.options.https != null) {
      return this.options.https ? 'https://' : 'http://';
    }
    return this.options.port === 443 ? 'https://' : 'http://';
  }

  private async _request<T>(options: InternalRequestOptions) {
    const reqUrl = this.getServerScheme() + this.serverUrl + options.uri;
    const method = options.method;
    const timeout = this.options.timeout;
    const parseResponse = options.parseResponse;
    const extraHeaders = options.extraHeaders || {};

    try {
      const response = await fetch(reqUrl, {
        method: method,
        headers: {
          Accept: 'application/json',
          'X-Plex-Token': this.options.token,
          Connection: 'close',
          ...extraHeaders,
        },
        signal: timeout ? AbortSignal.timeout(timeout) : undefined,
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            'Plex Server denied request due to lack of managed user permissions! In case of a delete request, delete content must be allowed in plex-media-server options.',
          );
        } else if (response.status === 401) {
          throw new Error('Plex Server denied request');
        }

        throw new Error(
          `Plex Server didnt respond with a valid 2xx status code, response code: ${response.status}`,
        );
      } else {
        if (parseResponse) {
          const contentType = response.headers.get('content-type');

          if (contentType === 'application/json') {
            return response.json() as T;
          } else if (contentType?.includes('xml')) {
            const text = await response.text();
            return xml2js.parseStringPromise(text, {
              attrkey: 'attributes',
            }) as T;
          } else {
            return response.text();
          }
        } else {
          return;
        }
      }
    } catch (err) {
      throw err;
    }
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

  public async getStatus(): Promise<boolean> {
    try {
      const status: { MediaContainer: any } = await this.query(
        { uri: `/` },
        false,
      );
      return status?.MediaContainer ? true : false;
    } catch (err) {
      return false;
    }
  }
}

const uriResolvers = {
  directory: function directory(parentUrl: string, dir: any) {
    addDirectoryUriProperty(parentUrl, dir);
  },
  server: function server(parentUrl: string, srv: any) {
    addServerUriProperty(srv);
  },
};

const addServerUriProperty = (server: any) => {
  server.uri = '/system/players/' + server.address;
};

const addDirectoryUriProperty = (parentUrl: string, directory: any) => {
  if (parentUrl[parentUrl.length - 1] !== '/') {
    parentUrl += '/';
  }
  if (directory.key[0] === '/') {
    parentUrl = '';
  }
  directory.uri = parentUrl + directory.key;
};

const attachUri = (parentUrl: string) => {
  return function resolveAndAttachUris(result: any) {
    const children = result._children || [];

    children.forEach(function (child: any) {
      const childType = child._elementType.toLowerCase();
      const resolver = uriResolvers[childType];

      if (resolver) {
        resolver(parentUrl, child);
      }
    });

    return result;
  };
};

export default PlexApi;
