import {
  EPlexDataType,
  PlexMetadata,
  ServarrAction,
} from '@maintainerr/contracts';
import { Injectable, Logger } from '@nestjs/common';
import { RadarrActionHandler } from '../actions/radarr-action-handler';
import { SonarrActionHandler } from '../actions/sonarr-action-handler';
import { OverseerrApiService } from '../api/overseerr-api/overseerr-api.service';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { SettingsService } from '../settings/settings.service';
import { CollectionsService } from './collections.service';
import { Collection } from './entities/collection.entities';
import { CollectionMedia } from './entities/collection_media.entities';

@Injectable()
export class CollectionHandler {
  private readonly logger = new Logger(CollectionHandler.name);

  constructor(
    private readonly plexApi: PlexApiService,
    private readonly collectionService: CollectionsService,
    private readonly overseerrApi: OverseerrApiService,
    private readonly settings: SettingsService,
    private readonly radarrActionHandler: RadarrActionHandler,
    private readonly sonarrActionHandler: SonarrActionHandler,
  ) {}

  public async handleMedia(collection: Collection, media: CollectionMedia) {
    if (collection.arrAction === ServarrAction.DO_NOTHING) {
      return;
    }

    const plexData: PlexMetadata = undefined;

    const plexLibrary = (await this.plexApi.getLibraries()).find(
      (e) => +e.key === +collection.libraryId,
    );

    // TODO Media should only be removed from the collection if the handle action is performed successfully
    await this.collectionService.removeFromCollection(collection.id, [
      {
        plexId: media.plexId,
      },
    ]);

    // update handled media amount
    collection.handledMediaAmount++;

    // save a log record for the handled media item
    this.collectionService.CollectionLogRecordForChild(
      media.plexId,
      collection.id,
      'handle',
    );

    this.collectionService.saveCollection(collection);

    if (plexLibrary.type === 'movie' && collection.radarrSettingsId) {
      await this.radarrActionHandler.handleAction(collection, media);
    } else if (plexLibrary.type == 'show' && collection.sonarrSettingsId) {
      await this.sonarrActionHandler.handleAction(collection, media);
    } else if (!collection.radarrSettingsId && !collection.sonarrSettingsId) {
      if (collection.arrAction !== ServarrAction.UNMONITOR) {
        this.logger.log(
          `Couldn't utilize *arr to find and remove the media with id ${media.plexId}. Attempting to remove from the filesystem via Plex. No unmonitor action was taken.`,
        );
        await this.plexApi.deleteMediaFromDisk(media.plexId.toString());
      } else {
        this.logger.log(
          `*arr unmonitor action isn't possible, since *arr is not available. Didn't unmonitor media with id ${media.plexId}.}`,
        );
      }
    }

    // Only remove requests & file if needed
    if (collection.arrAction !== ServarrAction.UNMONITOR) {
      // overseerr, if forced. Otherwise rely on media sync
      if (this.settings.overseerrConfigured() && collection.forceOverseerr) {
        switch (collection.type) {
          case EPlexDataType.SEASONS:
            await this.overseerrApi.removeSeasonRequest(
              media.tmdbId,
              plexData.index,
            );
            this.logger.log(
              `[Overseerr] Removed request of season ${plexData.index} from show with tmdbid '${media.tmdbId}'`,
            );
            break;
          case EPlexDataType.EPISODES:
            await this.overseerrApi.removeSeasonRequest(
              media.tmdbId,
              plexData.parentIndex,
            );
            this.logger.log(
              `[Overseerr] Removed request of season ${plexData.parentIndex} from show with tmdbid '${media.tmdbId}'. Because episode ${plexData.index} was removed.'`,
            );
            break;
          default:
            await this.overseerrApi.removeMediaByTmdbId(
              media.tmdbId,
              plexLibrary.type === 'show' ? 'tv' : 'movie',
            );
            this.logger.log(
              `[Overseerr] Removed requests of media with tmdbid '${media.tmdbId}'`,
            );
            break;
        }
      }
    }
  }
}
