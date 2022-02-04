import { Injectable } from '@nestjs/common';
import { PlexMetadata } from 'src/modules/api/plex-api/interfaces/media.interface';
import { PlexApiService } from 'src/modules/api/plex-api/plex-api.service';
import { TmdbApiService } from 'src/modules/api/tmdb-api/tmdb.service';
import { PlexLibraryItem } from '../plex-api/interfaces/library.interfaces';

@Injectable()
export class TmdbIdService {
  constructor(
    private readonly tmdbApi: TmdbApiService,
    private readonly plexApi: PlexApiService,
  ) {}
  async getTmdbIdFromPlexRatingKey(
    ratingKey: string,
  ): Promise<{ type: 'movie' | 'tv'; id: number | undefined }> {
    const libItem: PlexMetadata = await this.plexApi.getMetadata(ratingKey);
    return this.getTmdbIdFromPlexData(libItem);
  }

  async getTmdbIdFromPlexData(
    libItem: PlexMetadata | PlexLibraryItem,
  ): Promise<{ type: 'movie' | 'tv'; id: number | undefined }> {
    const id = libItem.Guid
      ? +libItem.Guid.find((el) => el.id.includes('tmdb')).id.split('://')[1]
      : libItem.guid.includes('tmdb')
      ? +libItem.guid.split('://')[1].split('?')[0]
      : libItem.guid.includes('tvdb')
      ? await this.tmdbApi
          .getByExternalId({
            externalId: +libItem.guid.split('://')[1].split('?')[0],
            type: 'tvdb',
          })
          .then((resp) =>
            resp?.movie_results.length > 0
              ? resp?.movie_results[0].id
              : resp?.tv_results[0].id,
          )
      : libItem.guid.includes('imdb')
      ? await this.tmdbApi
          .getByExternalId({
            externalId: libItem.guid.split('://')[1].split('?')[0].toString(),
            type: 'imdb',
          })
          .then((resp) =>
            resp?.movie_results.length > 0
              ? resp?.movie_results[0].id
              : resp?.tv_results[0].id,
          )
      : undefined;
    return {
      type: ['show', 'season', 'episode'].includes(libItem.type)
        ? 'tv'
        : 'movie',
      id: id,
    };
  }
}
