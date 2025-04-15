import {
  EPlexDataType,
  PlexMetadata,
  ServarrAction,
} from '@maintainerr/contracts';
import { Injectable, Logger } from '@nestjs/common';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { ServarrService } from '../api/servarr-api/servarr.service';
import { TmdbIdService } from '../api/tmdb-api/tmdb-id.service';
import { Collection } from '../collections/entities/collection.entities';
import { CollectionMedia } from '../collections/entities/collection_media.entities';
import { MediaIdFinder } from './media-id-finder';

@Injectable()
export class SonarrActionHandler {
  private readonly logger = new Logger(SonarrActionHandler.name);

  constructor(
    private readonly servarrApi: ServarrService,
    private readonly plexApi: PlexApiService,
    private readonly tmdbIdService: TmdbIdService,
    private readonly mediaIdFinder: MediaIdFinder,
  ) {}

  public async handleAction(
    collection: Collection,
    media: Omit<CollectionMedia, 'collection'>,
  ): Promise<void> {
    const sonarrApiClient = await this.servarrApi.getSonarrApiClient(
      collection.sonarrSettingsId,
    );

    let plexData: PlexMetadata = undefined;

    // get the tvdb id
    let tvdbId = undefined;
    switch (collection.type) {
      case EPlexDataType.SEASONS:
        plexData = await this.plexApi.getMetadata(media.plexId.toString());
        tvdbId = await this.mediaIdFinder.findTvdbId(
          plexData.parentRatingKey,
          media.tmdbId,
        );
        media.tmdbId = media.tmdbId
          ? media.tmdbId
          : (
              await this.tmdbIdService.getTmdbIdFromPlexRatingKey(
                plexData.parentRatingKey,
              )
            )?.id;
        break;
      case EPlexDataType.EPISODES:
        plexData = await this.plexApi.getMetadata(media.plexId.toString());
        tvdbId = await this.mediaIdFinder.findTvdbId(
          plexData.grandparentRatingKey,
          media.tmdbId,
        );
        media.tmdbId = media.tmdbId
          ? media.tmdbId
          : (
              await this.tmdbIdService.getTmdbIdFromPlexRatingKey(
                plexData.grandparentRatingKey.toString(),
              )
            )?.id;
        break;
      default:
        tvdbId = await this.mediaIdFinder.findTvdbId(
          media.plexId,
          media.tmdbId,
        );
        media.tmdbId = media.tmdbId
          ? media.tmdbId
          : (
              await this.tmdbIdService.getTmdbIdFromPlexRatingKey(
                media.plexId.toString(),
              )
            )?.id;
        break;
    }

    if (!tvdbId) {
      this.logger.log(
        `Couldn't find correct tvdb id. No action was taken for show: https://www.themoviedb.org/tv/${media.tmdbId}. Please check this show manually`,
      );
      return;
    }

    let sonarrMedia = await sonarrApiClient.getSeriesByTvdbId(tvdbId);

    if (!sonarrMedia?.id) {
      if (collection.arrAction !== ServarrAction.UNMONITOR) {
        this.logger.log(
          `Couldn't find correct tvdb id. No Sonarr action was taken for show: https://www.themoviedb.org/tv/${media.tmdbId}. Attempting to remove from the filesystem via Plex.`,
        );
        this.plexApi.deleteMediaFromDisk(media.plexId.toString());
      } else {
        this.logger.log(
          `Couldn't find correct tvdb id. No unmonitor action was taken for show: https://www.themoviedb.org/tv/${media.tmdbId}`,
        );
      }
      return;
    }

    switch (collection.arrAction) {
      case ServarrAction.DELETE:
        switch (collection.type) {
          case EPlexDataType.SEASONS:
            sonarrMedia = await sonarrApiClient.unmonitorSeasons(
              sonarrMedia.id,
              plexData.index,
              true,
            );
            this.logger.log(
              `[Sonarr] Removed season ${plexData.index} from show '${sonarrMedia.title}'`,
            );
            break;
          case EPlexDataType.EPISODES:
            await sonarrApiClient.UnmonitorDeleteEpisodes(
              sonarrMedia.id,
              plexData.parentIndex,
              [plexData.index],
              true,
            );
            this.logger.log(
              `[Sonarr] Removed season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
            );
            break;
          default:
            await sonarrApiClient.deleteShow(
              sonarrMedia.id,
              true,
              collection.listExclusions,
            );
            this.logger.log(`Removed show ${sonarrMedia.title}' from Sonarr`);
            break;
        }
        break;
      case ServarrAction.UNMONITOR:
        switch (collection.type) {
          case EPlexDataType.SEASONS:
            sonarrMedia = await sonarrApiClient.unmonitorSeasons(
              sonarrMedia.id,
              plexData.index,
              false,
            );
            this.logger.log(
              `[Sonarr] Unmonitored season ${plexData.index} from show '${sonarrMedia.title}'`,
            );
            break;
          case EPlexDataType.EPISODES:
            await sonarrApiClient.UnmonitorDeleteEpisodes(
              sonarrMedia.id,
              plexData.parentIndex,
              [plexData.index],
              false,
            );
            this.logger.log(
              `[Sonarr] Unmonitored season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
            );
            break;
          default:
            sonarrMedia = await sonarrApiClient.unmonitorSeasons(
              sonarrMedia.id,
              'all',
              false,
            );

            if (sonarrMedia) {
              // unmonitor show
              sonarrMedia.monitored = false;
              sonarrApiClient.updateSeries(sonarrMedia);
              this.logger.log(
                `[Sonarr] Unmonitored show '${sonarrMedia.title}'`,
              );
            }

            break;
        }
        break;
      case ServarrAction.UNMONITOR_DELETE_ALL:
        switch (collection.type) {
          case EPlexDataType.SHOWS:
            sonarrMedia = await sonarrApiClient.unmonitorSeasons(
              sonarrMedia.id,
              'all',
              true,
            );

            if (sonarrMedia) {
              // unmonitor show
              sonarrMedia.monitored = false;
              sonarrApiClient.updateSeries(sonarrMedia);
              this.logger.log(
                `[Sonarr] Unmonitored show '${sonarrMedia.title}' and removed all episodes`,
              );
            }

            break;
          default:
            this.logger.warn(
              `[Sonarr] UNMONITOR_DELETE_ALL is not supported for type: ${collection.type}`,
            );
            break;
        }
        break;
      case ServarrAction.UNMONITOR_DELETE_EXISTING:
        switch (collection.type) {
          case EPlexDataType.SEASONS:
            sonarrMedia = await sonarrApiClient.unmonitorSeasons(
              sonarrMedia.id,
              plexData.index,
              true,
              true,
            );
            this.logger.log(
              `[Sonarr] Removed exisiting episodes from season ${plexData.index} from show '${sonarrMedia.title}'`,
            );
            break;
          case EPlexDataType.SHOWS:
            sonarrMedia = await sonarrApiClient.unmonitorSeasons(
              sonarrMedia.id,
              'existing',
              true,
            );

            if (sonarrMedia) {
              // unmonitor show
              sonarrMedia.monitored = false;
              sonarrApiClient.updateSeries(sonarrMedia);
              this.logger.log(
                `[Sonarr] Unmonitored show '${sonarrMedia.title}' and Removed exisiting episodes`,
              );
            }

            break;
          default:
            this.logger.warn(
              `[Sonarr] UNMONITOR_DELETE_EXISTING is not supported for type: ${collection.type}`,
            );
            break;
        }
        break;
    }
  }
}
