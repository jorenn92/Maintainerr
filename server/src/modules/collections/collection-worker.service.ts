import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OverseerrApiService } from '../api/overseerr-api/overseerr-api.service';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { ServarrService } from '../api/servarr-api/servarr.service';
import { TmdbApiService } from '../api/tmdb-api/tmdb.service';
import { SettingsService } from '../settings/settings.service';
import { TasksService } from '../tasks/tasks.service';
import { CollectionsService } from './collections.service';
import { Collection } from './entities/collection.entities';
import { CollectionMedia } from './entities/collection_media.entities';
import { ServarrAction } from './interfaces/collection.interface';
import { PlexMetadata } from '../api/plex-api/interfaces/media.interface';
import { EPlexDataType } from '../api/plex-api/enums/plex-data-type-enum';
import { TmdbIdService } from '../api/tmdb-api/tmdb-id.service';
import cacheManager from '../api/lib/cache';

@Injectable()
export class CollectionWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CollectionWorkerService.name);
  private jobCreationAttempts = 0;
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionMedia)
    private readonly collectionMediaRepo: Repository<CollectionMedia>,
    private readonly collectionService: CollectionsService,
    private readonly plexApi: PlexApiService,
    private readonly overseerrApi: OverseerrApiService,
    private readonly servarrApi: ServarrService,
    private readonly tmdbApi: TmdbApiService,
    private readonly taskService: TasksService,
    private readonly settings: SettingsService,
    private readonly tmdbIdService: TmdbIdService,
  ) {}

  onApplicationBootstrap() {
    this.jobCreationAttempts++;
    const state = this.taskService.createJob(
      'CollectionHandler',
      this.settings.collection_handler_job_cron,
      this.handle.bind(this),
    );
    if (state.code === 0) {
      if (this.jobCreationAttempts <= 3) {
        this.logger.log(
          'Creation of job CollectionHandler failed. Retrying in 10s..',
        );
        setTimeout(() => {
          this.onApplicationBootstrap();
        }, 10000);
      } else {
        this.logger.error(`Creation of job CollectionHandler failed.`);
      }
    }
  }

  public updateJob(cron: string) {
    return this.taskService.updateJob(
      'CollectionHandler',
      cron,
      this.handle.bind(this),
    );
  }

  public async handle() {
    const appStatus = await this.settings.testConnections();

    // reset API caches, make sure latest data is used
    for (const [key, value] of Object.entries(cacheManager.getAllCaches())) {
      value.flush();
    }

    this.logger.log('Start handling all collections.');
    let handledCollections = 0;
    if (appStatus) {
      // loop over all active collections
      const collections = await this.collectionRepo.find({
        where: { isActive: true },
      });
      for (const collection of collections) {
        this.infoLogger(`Handling collection '${collection.title}'`);

        const collectionMedia = await this.collectionMediaRepo.find({
          where: {
            collectionId: collection.id,
          },
        });

        const dangerDate = new Date(
          new Date().getTime() - +collection.deleteAfterDays * 86400000,
        );

        for (const media of collectionMedia) {
          // handle media addate <= due date
          if (new Date(media.addDate) <= dangerDate) {
            await this.handleMedia(collection, media);
            handledCollections++;
          }
        }
        this.infoLogger(`Handling collection '${collection.title}' finished`);
      }
      if (handledCollections > 0) {
        if (this.settings.overseerrConfigured()) {
          setTimeout(() => {
            this.overseerrApi.api
              .post('/settings/jobs/availability-sync/run')
              .then(() => {
                this.infoLogger(
                  `All collections handled. Triggered Overseerr's availability-sync because media was altered`,
                );
              });
          }, 7000);
        }
      } else {
        this.infoLogger(`All collections handled. No data was altered`);
      }
    } else {
      this.infoLogger(
        'Not all applications are reachable.. Skipping collection handling',
      );
    }
  }

  private async handleMedia(collection: Collection, media: CollectionMedia) {
    let plexData: PlexMetadata = undefined;

    const plexLibrary = (await this.plexApi.getLibraries()).find(
      (e) => +e.key === +collection.libraryId,
    );

    await this.collectionService.removeFromCollection(collection.id, [
      {
        plexId: media.plexId,
      },
    ]);

    if (plexLibrary.type === 'movie') {
      if (this.settings.radarrConfigured()) {
        const radarrMedia = await this.servarrApi.RadarrApi.getMovieByTmdbId(
          media.tmdbId,
        );
        switch (collection.arrAction) {
          case ServarrAction.DELETE:
            await this.servarrApi.RadarrApi.deleteMovie(
              radarrMedia.id,
              true,
              collection.listExclusions,
            );
            this.infoLogger('Removed movie from filesystem & Radarr');
            break;
          case ServarrAction.UNMONITOR:
            await this.servarrApi.RadarrApi.unmonitorMovie(
              radarrMedia.id,
              false,
            );
            this.infoLogger('Unmonitored movie in Radarr');
            break;
          case ServarrAction.DELETE_UNMONITOR_ALL:
            await this.servarrApi.RadarrApi.unmonitorMovie(
              radarrMedia.id,
              true,
            );
            this.infoLogger('Unmonitored movie in Radarr & removed files');
            break;
          case ServarrAction.DELETE_UNMONITOR_EXISTING:
            await this.servarrApi.RadarrApi.deleteMovie(
              radarrMedia.id,
              true,
              collection.listExclusions,
            );
            this.infoLogger('Removed movie from filesystem & Radarr');
            break;
        }
      }
    } else {
      if (this.settings.sonarrConfigured()) {
        // get the tvdb id
        let tvdbId = undefined;
        switch (collection.type) {
          case EPlexDataType.SEASONS:
            plexData = await this.plexApi.getMetadata(media.plexId.toString());
            tvdbId = await this.tvdbidFinder({
              ...media,
              ...{ plexID: plexData.parentRatingKey },
            });
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
            tvdbId = await this.tvdbidFinder({
              ...media,
              ...{ plexID: plexData.grandparentRatingKey },
            });
            media.tmdbId = media.tmdbId
              ? media.tmdbId
              : (
                  await this.tmdbIdService.getTmdbIdFromPlexRatingKey(
                    plexData.grandparentRatingKey.toString(),
                  )
                )?.id;
            break;
          default:
            tvdbId = await this.tvdbidFinder(media);
            media.tmdbId = media.tmdbId
              ? media.tmdbId
              : (
                  await this.tmdbIdService.getTmdbIdFromPlexRatingKey(
                    plexData.ratingKey,
                  )
                )?.id;
            break;
        }

        if (tvdbId) {
          const sonarrMedia =
            await this.servarrApi.SonarrApi.getSeriesByTvdbId(tvdbId);
          if (sonarrMedia) {
            switch (collection.arrAction) {
              case ServarrAction.DELETE:
                switch (collection.type) {
                  case EPlexDataType.SEASONS:
                    await this.servarrApi.SonarrApi.unmonitorSeasons(
                      sonarrMedia.id,
                      plexData.index,
                      true,
                    );
                    this.infoLogger(
                      `[Sonarr] Removed season ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  case EPlexDataType.EPISODES:
                    await this.servarrApi.SonarrApi.UnmonitorDeleteEpisodes(
                      sonarrMedia.id,
                      plexData.parentIndex,
                      [plexData.index],
                      true,
                    );
                    this.infoLogger(
                      `[Sonarr] Removed season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  default:
                    await this.servarrApi.SonarrApi.deleteShow(
                      sonarrMedia.id,
                      true,
                      collection.listExclusions,
                    );
                    this.infoLogger(
                      `Removed show ${sonarrMedia.title}' from Sonarr`,
                    );
                    break;
                }
                break;
              case ServarrAction.UNMONITOR:
                switch (collection.type) {
                  case EPlexDataType.SEASONS:
                    await this.servarrApi.SonarrApi.unmonitorSeasons(
                      sonarrMedia.id,
                      plexData.index,
                      false,
                    );
                    this.infoLogger(
                      `[Sonarr] Unmonitored season ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  case EPlexDataType.EPISODES:
                    await this.servarrApi.SonarrApi.UnmonitorDeleteEpisodes(
                      sonarrMedia.id,
                      plexData.parentIndex,
                      [plexData.index],
                      false,
                    );
                    this.infoLogger(
                      `[Sonarr] Unmonitored season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  default:
                    await this.servarrApi.SonarrApi.unmonitorSeasons(
                      sonarrMedia.id,
                      'all',
                      false,
                    );
                    this.infoLogger(
                      `[Sonarr] Unmonitored show '${sonarrMedia.title}'`,
                    );
                    break;
                }
                break;
              case ServarrAction.DELETE_UNMONITOR_ALL:
                switch (collection.type) {
                  case EPlexDataType.SEASONS:
                    await this.servarrApi.SonarrApi.unmonitorSeasons(
                      sonarrMedia.id,
                      plexData.index,
                      true,
                    );
                    this.infoLogger(
                      `[Sonarr] Removed season ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  case EPlexDataType.EPISODES:
                    await this.servarrApi.SonarrApi.UnmonitorDeleteEpisodes(
                      sonarrMedia.id,
                      plexData.parentIndex,
                      [plexData.index],
                      true,
                    );
                    this.infoLogger(
                      `[Sonarr] Removed season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  default:
                    await this.servarrApi.SonarrApi.unmonitorSeasons(
                      sonarrMedia.id,
                      'all',
                      true,
                    );
                    this.infoLogger(
                      `Removed show ${sonarrMedia.title}' from Sonarr`,
                    );
                    break;
                }
                break;
              case ServarrAction.DELETE_UNMONITOR_EXISTING:
                switch (collection.type) {
                  case EPlexDataType.SEASONS:
                    await this.servarrApi.SonarrApi.unmonitorSeasons(
                      sonarrMedia.id,
                      plexData.index,
                      true,
                      true,
                    );
                    this.infoLogger(
                      `[Sonarr] Removed exisiting episodes from season ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  case EPlexDataType.EPISODES:
                    await this.servarrApi.SonarrApi.UnmonitorDeleteEpisodes(
                      sonarrMedia.id,
                      plexData.parentIndex,
                      [plexData.index],
                      true,
                    );
                    this.infoLogger(
                      `[Sonarr] Removed season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
                    );
                    break;
                  default:
                    await this.servarrApi.SonarrApi.unmonitorSeasons(
                      sonarrMedia.id,
                      'existing',
                      true,
                    );
                    this.infoLogger(
                      `[Sonarr] Removed exisiting episodes from show '${sonarrMedia.title}'`,
                    );
                    break;
                }
                break;
            }
          } else {
            this.infoLogger(
              `Couldn't find correct tvdbid. No action taken for show: https://www.themoviedb.org/tv/${media.tmdbId}`,
            );
          }
        } else {
          this.infoLogger(
            `Couldn't find correct tvdbid. No action taken for show: https://www.themoviedb.org/tv/${media.tmdbId}`,
          );
        }
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
            this.infoLogger(
              `[Overseerr] Removed request of season ${plexData.index} from show with tmdbid '${media.tmdbId}'`,
            );
            break;
          case EPlexDataType.EPISODES:
            await this.overseerrApi.removeSeasonRequest(
              media.tmdbId,
              plexData.parentIndex,
            );
            this.infoLogger(
              `[Overseerr] Removed request of season ${plexData.parentIndex} from show with tmdbid '${media.tmdbId}'. Because episode ${plexData.index} was removed.'`,
            );
            break;
          default:
            await this.overseerrApi.removeMediaByTmdbId(
              media.tmdbId,
              plexLibrary.type === 'show' ? 'tv' : 'movie',
            );
            this.infoLogger(
              `[Overseerr] Removed requests of media with tmdbid '${media.tmdbId}'`,
            );
            break;
        }
      }

      // If *arr not configured, remove media through Plex
      if (
        !(plexLibrary.type === 'movie'
          ? this.settings.radarrConfigured()
          : this.settings.sonarrConfigured())
      )
        await this.plexApi.deleteMediaFromDisk(media.plexId);
    }
  }

  private async tvdbidFinder(media: CollectionMedia) {
    let tvdbid = undefined;
    const tmdbShow = await this.tmdbApi.getTvShow({ tvId: media.tmdbId });
    if (!tmdbShow?.external_ids?.tvdb_id) {
      let plexData = await this.plexApi.getMetadata(media.plexId.toString());
      // fetch correct record for seasons & episodes
      plexData = plexData.grandparentRatingKey
        ? await this.plexApi.getMetadata(
            plexData.grandparentRatingKey.toString(),
          )
        : plexData.parentRatingKey
        ? await this.plexApi.getMetadata(plexData.parentRatingKey.toString())
        : plexData;

      const tvdbidPlex = plexData.Guid.find((el) => el.id.includes('tvdb'));
      tvdbid = tvdbidPlex.id.split('tvdb://')[1];
    } else {
      tvdbid = tmdbShow.external_ids.tvdb_id;
    }
    return tvdbid;
  }

  private infoLogger(message: string) {
    this.logger.log(message);
  }
}
