import { Injectable } from '@nestjs/common';
import {
  OverseerrApiService,
  OverSeerrMediaResponse,
  OverseerrMediaStatus,
} from 'src/modules/api/overseerr-api/overseerr-api.service';
import {
  PlexLibraryItem,
  PlexUser,
} from 'src/modules/api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from 'src/modules/api/plex-api/plex-api.service';
import { TmdbApiService } from 'src/modules/api/tmdb-api/tmdb.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class OverseerrGetterService {
  plexProperties: Property[];
  constructor(
    private readonly overseerrApi: OverseerrApiService,
    private readonly tmdbApi: TmdbApiService,
    private readonly plexApi: PlexApiService,
  ) {
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.OVERSEERR,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem) {
    const prop = this.plexProperties.find((el) => el.id === id);
    const tmdb = libItem.Guid
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
      : null;
    let mediaResponse: OverSeerrMediaResponse;
    if (tmdb) {
      if (libItem.type === 'movie') {
        mediaResponse = await this.overseerrApi.getMovie(tmdb.toString());
      } else {
        mediaResponse = await this.overseerrApi.getShow(tmdb.toString());
      }
    }
    if (mediaResponse && mediaResponse.mediaInfo) {
      switch (prop.name) {
        case 'addUser': {
          const plexUsers = (await this.plexApi.getUsers()).map((el) => {
            return { plexId: el.id, username: el.name } as PlexUser;
          });
          const usersIds: number[] = [];
          for (const request of mediaResponse.mediaInfo?.requests) {
            usersIds.push(
              plexUsers.find(
                (u) => u.username === request?.requestedBy?.plexUsername,
              ).plexId,
            );
          }
          return usersIds;
        }
        case 'requestDate': {
          return new Date(mediaResponse?.mediaInfo?.requests[0]?.createdAt);
        }
        case 'approvalDate': {
          return mediaResponse?.mediaInfo.status >=
            OverseerrMediaStatus.PARTIALLY_AVAILABLE
            ? new Date(mediaResponse?.mediaInfo?.updatedAt)
            : null;
        }
        case 'mediaAddedAt': {
          return mediaResponse?.mediaInfo.status >=
            OverseerrMediaStatus.PARTIALLY_AVAILABLE
            ? new Date(mediaResponse?.mediaInfo?.mediaAddedAt)
            : null;
        }
        default: {
          return null;
        }
      }
    } else {
      return null;
    }
  }
}
