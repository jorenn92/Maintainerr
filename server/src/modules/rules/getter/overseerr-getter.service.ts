import { Injectable, Logger } from '@nestjs/common';
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
import { TmdbIdService } from 'src/modules/api/tmdb-api/tmdb-id.service';
import { TmdbApiService } from 'src/modules/api/tmdb-api/tmdb.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class OverseerrGetterService {
  plexProperties: Property[];
  private readonly logger = new Logger(OverseerrGetterService.name);

  constructor(
    private readonly overseerrApi: OverseerrApiService,
    private readonly tmdbApi: TmdbApiService,
    private readonly plexApi: PlexApiService,
    private readonly tmdbIdHelper: TmdbIdService,
  ) {
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.OVERSEERR,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem) {
    const prop = this.plexProperties.find((el) => el.id === id);
    const tmdb = await this.tmdbIdHelper.getTmdbIdFromPlexData(libItem);

    let mediaResponse: OverSeerrMediaResponse;
    if (tmdb && tmdb.id) {
      if (libItem.type === 'movie') {
        mediaResponse = await this.overseerrApi.getMovie(tmdb.id.toString());
      } else {
        mediaResponse = await this.overseerrApi.getShow(tmdb.id.toString());
      }
    }
    if (mediaResponse && mediaResponse.mediaInfo) {
      switch (prop.name) {
        case 'addUser': {
          try {
            const plexUsers = (await this.plexApi.getUsers()).map((el) => {
              return { plexId: el.id, username: el.name } as PlexUser;
            });
            const usersIds: number[] = [];
            if (
              mediaResponse &&
              mediaResponse.mediaInfo &&
              mediaResponse.mediaInfo.requests
            ) {
              for (const request of mediaResponse.mediaInfo.requests) {
                usersIds.push(
                  plexUsers.find(
                    (u) => u.username === request.requestedBy?.plexUsername,
                  )?.plexId,
                );
              }
              return usersIds;
            }
            return [];
          } catch (e) {
            this.logger.warn("Couldn't get addUser from Overseerr", {
              label: 'Overseerr API',
              errorMessage: e.message,
            });
          }
        }
        case 'amountRequested': {
          return mediaResponse?.mediaInfo.requests.length;
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
