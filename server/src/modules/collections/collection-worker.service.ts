import { Injectable, Logger } from '@nestjs/common';
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
import { TaskBase } from '../tasks/task.base';
import { JellyseerrApiService } from '../api/jellyseerr-api/jellyseerr-api.service';

@Injectable()
export class CollectionWorkerService extends TaskBase {
  protected logger = new Logger(CollectionWorkerService.name);

  protected name = 'Collection Handler';
  protected cronSchedule = ''; // overriden in onBootstrapHook

  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionMedia)
    private readonly collectionMediaRepo: Repository<CollectionMedia>,
    private readonly collectionService: CollectionsService,
    private readonly plexApi: PlexApiService,
    private readonly overseerrApi: OverseerrApiService,
    private readonly jellyseerrApi: JellyseerrApiService,
    private readonly servarrApi: ServarrService,
    private readonly tmdbApi: TmdbApiService,
    protected readonly taskService: TasksService,
    private readonly settings: SettingsService,
    private readonly tmdbIdService: TmdbIdService,
    private readonly tmdbIdHelper: TmdbIdService,
  ) {
    super(taskService);
  }

  protected onBootstrapHook(): void {
    this.cronSchedule = this.settings.collection_handler_job_cron;
  }

  public async execute() {
    // check if another instance of this task is already running
    if (await this.isRunning()) {
      this.logger.log(
        `Another instance of the ${this.name} task is currently running. Skipping this execution`,
      );
      return;
    }

    await super.execute();

    // wait 5 seconds to make sure we're not executing together with the rule handler
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // if we are, then wait..
    await this.taskService.waitUntilTaskIsFinished('Rule Handler', this.name);

    // Start actual task
    const appStatus = await this.settings.testConnections();

    this.logger.log('Start handling all collections');
    let handledCollections = 0;
    if (appStatus) {
      // loop over all active collections
      const collections = await this.collectionRepo.find({
        where: { isActive: true },
      });

      for (const collection of collections) {
        if (collection.arrAction === ServarrAction.DO_NOTHING) {
          this.infoLogger(
            `Skipping collection '${collection.title}' as its action is 'Do Nothing'`,
          );
          continue;
        }

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
              })
              .catch((err) => {
                this.logger.error(
                  `Failed to trigger Overseerr's availability-sync: ${err}`,
                );
                this.logger.debug(err);
              });
          }, 7000);
        }

        if (this.settings.jellyseerrConfigured()) {
          setTimeout(() => {
            this.jellyseerrApi.api
              .post('/settings/jobs/availability-sync/run')
              .then(() => {
                this.infoLogger(
                  `All collections handled. Triggered Jellyseerr's availability-sync because media was altered`,
                );
              })
              .catch((err) => {
                this.logger.error(
                  `Failed to trigger Jellyseerr's availability-sync: ${err}`,
                );
                this.logger.debug(err);
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
    await this.finish();
  }

  private async handleMedia(collection: Collection, media: CollectionMedia) {
    if (collection.arrAction === ServarrAction.DO_NOTHING) {
      // Sanity check, ideally we shouldn't ever call handleMedia on a collection with servarr
      // action DO_NOTHING, but if we do, ensure we do nothing.
      return;
    }
    let plexData: PlexMetadata = undefined;

    const plexLibrary = (await this.plexApi.getLibraries()).find(
      (e) => +e.key === +collection.libraryId,
    );

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

    const radarrApiClient = collection.radarrSettingsId
      ? await this.servarrApi.getRadarrApiClient(collection.radarrSettingsId)
      : undefined;

    const sonarrApiClient = collection.sonarrSettingsId
      ? await this.servarrApi.getSonarrApiClient(collection.sonarrSettingsId)
      : undefined;

    if (plexLibrary.type === 'movie' && radarrApiClient) {
      // find tmdbid
      const tmdbid = media.tmdbId
        ? media.tmdbId
        : (
            await this.tmdbIdService.getTmdbIdFromPlexRatingKey(
              media.plexId.toString(),
            )
          )?.id;

      if (tmdbid) {
        const radarrMedia = await radarrApiClient.getMovieByTmdbId(tmdbid);
        if (radarrMedia && radarrMedia.id) {
          switch (collection.arrAction) {
            case ServarrAction.DELETE:
              await radarrApiClient.deleteMovie(
                radarrMedia.id,
                true,
                collection.listExclusions,
              );
              this.infoLogger('Removed movie from filesystem & Radarr');
              break;
            case ServarrAction.UNMONITOR:
              await radarrApiClient.unmonitorMovie(radarrMedia.id, false);
              this.infoLogger('Unmonitored movie in Radarr');
              break;
            case ServarrAction.UNMONITOR_DELETE_ALL:
              await radarrApiClient.unmonitorMovie(radarrMedia.id, true);
              this.infoLogger('Unmonitored movie in Radarr & removed files');
              break;
            case ServarrAction.UNMONITOR_DELETE_EXISTING:
              await radarrApiClient.deleteMovie(
                radarrMedia.id,
                true,
                collection.listExclusions,
              );
              this.infoLogger('Removed movie from filesystem & Radarr');
              break;
          }
        } else {
          if (collection.arrAction !== ServarrAction.UNMONITOR) {
            this.infoLogger(
              `Couldn't find movie with tmdb id ${tmdbid} in Radarr, so no Radarr action was taken for movie with Plex ID ${media.plexId}. Attempting to remove from the filesystem via Plex.`,
            );
            this.plexApi.deleteMediaFromDisk(media.plexId.toString());
          } else {
            this.infoLogger(
              `Radarr unmonitor action was not possible, couldn't find movie with tmdb id ${tmdbid} in Radarr. No action was taken for movie with Plex ID ${media.plexId}`,
            );
          }
        }
      } else {
        this.infoLogger(
          `Couldn't find correct tmdb id. No action taken for movie with Plex ID: ${media.plexId}. Please check this movie manually`,
        );
      }
    } else if (plexLibrary.type == 'show' && sonarrApiClient) {
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
                  media.plexId.toString(),
                )
              )?.id;
          break;
      }

      if (tvdbId) {
        let sonarrMedia = await sonarrApiClient.getSeriesByTvdbId(tvdbId);
        if (sonarrMedia?.id) {
          switch (collection.arrAction) {
            case ServarrAction.DELETE:
              switch (collection.type) {
                case EPlexDataType.SEASONS:
                  sonarrMedia = await sonarrApiClient.unmonitorSeasons(
                    sonarrMedia.id,
                    plexData.index,
                    true,
                  );
                  this.infoLogger(
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
                  this.infoLogger(
                    `[Sonarr] Removed season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
                  );
                  break;
                default:
                  await sonarrApiClient.deleteShow(
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
                  sonarrMedia = await sonarrApiClient.unmonitorSeasons(
                    sonarrMedia.id,
                    plexData.index,
                    false,
                  );
                  this.infoLogger(
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
                  this.infoLogger(
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
                    this.infoLogger(
                      `[Sonarr] Unmonitored show '${sonarrMedia.title}'`,
                    );
                  }

                  break;
              }
              break;
            case ServarrAction.UNMONITOR_DELETE_ALL:
              switch (collection.type) {
                case EPlexDataType.SEASONS:
                  sonarrMedia = await sonarrApiClient.unmonitorSeasons(
                    sonarrMedia.id,
                    plexData.index,
                    true,
                  );
                  this.infoLogger(
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
                  this.infoLogger(
                    `[Sonarr] Removed season ${plexData.parentIndex} episode ${plexData.index} from show '${sonarrMedia.title}'`,
                  );
                  break;
                default:
                  sonarrMedia = await sonarrApiClient.unmonitorSeasons(
                    sonarrMedia.id,
                    'all',
                    true,
                  );

                  if (sonarrMedia) {
                    // unmonitor show
                    sonarrMedia.monitored = false;
                    sonarrApiClient.updateSeries(sonarrMedia);
                    this.infoLogger(
                      `[Sonarr] Unmonitored show '${sonarrMedia.title}' and removed all episodes`,
                    );
                  }

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
                  this.infoLogger(
                    `[Sonarr] Removed exisiting episodes from season ${plexData.index} from show '${sonarrMedia.title}'`,
                  );
                  break;
                case EPlexDataType.EPISODES:
                  await sonarrApiClient.UnmonitorDeleteEpisodes(
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
                  sonarrMedia = await sonarrApiClient.unmonitorSeasons(
                    sonarrMedia.id,
                    'existing',
                    true,
                  );

                  if (sonarrMedia) {
                    // unmonitor show
                    sonarrMedia.monitored = false;
                    sonarrApiClient.updateSeries(sonarrMedia);
                    this.infoLogger(
                      `[Sonarr] Unmonitored show '${sonarrMedia.title}' and Removed exisiting episodes`,
                    );
                  }

                  break;
              }
              break;
          }
        } else {
          if (collection.arrAction !== ServarrAction.UNMONITOR) {
            this.infoLogger(
              `Couldn't find correct tvdb id. No Sonarr action was taken for show: https://www.themoviedb.org/tv/${media.tmdbId}. Attempting to remove from the filesystem via Plex.`,
            );
            this.plexApi.deleteMediaFromDisk(media.plexId.toString());
          } else {
            this.infoLogger(
              `Couldn't find correct tvdb id. No unmonitor action was taken for show: https://www.themoviedb.org/tv/${media.tmdbId}`,
            );
          }
        }
      } else {
        this.infoLogger(
          `Couldn't find correct tvdb id. No action was taken for show: https://www.themoviedb.org/tv/${media.tmdbId}. Please check this show manually`,
        );
      }
    } else if (!radarrApiClient && !sonarrApiClient) {
      if (collection.arrAction !== ServarrAction.UNMONITOR) {
        this.infoLogger(
          `Couldn't utilize *arr to find and remove the media with id ${media.plexId}. Attempting to remove from the filesystem via Plex. No unmonitor action was taken.`,
        );
        await this.plexApi.deleteMediaFromDisk(media.plexId.toString());
      } else {
        this.infoLogger(
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
    }
  }

  private async tvdbidFinder(media: CollectionMedia) {
    let tvdbid = undefined;
    if (!media.tmdbId && media.plexId) {
      media.tmdbId = (
        await this.tmdbIdHelper.getTmdbIdFromPlexRatingKey(
          media.plexId.toString(),
        )
      )?.id;
    }

    const tmdbShow = media.tmdbId
      ? await this.tmdbApi.getTvShow({ tvId: media.tmdbId })
      : undefined;

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

      const tvdbidPlex = plexData?.Guid?.find((el) => el.id.includes('tvdb'));
      if (tvdbidPlex) {
        tvdbid = tvdbidPlex.id.split('tvdb://')[1];
      }
    } else {
      tvdbid = tmdbShow.external_ids.tvdb_id;
    }
    return tvdbid;
  }

  private infoLogger(message: string) {
    this.logger.log(message);
  }
}
