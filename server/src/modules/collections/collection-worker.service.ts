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

  public async handle() {
    // loop over all active collections
    const collections = await this.collectionRepo.find({ isActive: true });
    for (const collection of collections) {
      this.infoLogger(`Handling collection '${collection.title}'`);

      const collectionMedia = await this.collectionMediaRepo.find({
        collectionId: collection.id,
      });

      const dangerDate = new Date(
        new Date().getTime() - +collection.deleteAfterDays * 86400000,
      );

      for (const media of collectionMedia) {
        // delete media addate <= due date
        if (new Date(media.addDate) <= dangerDate) {
          this.deleteMedia(collection, media);
        }
      }
    }
  }

  private async deleteMedia(collection: Collection, media: CollectionMedia) {
    this.infoLogger(`Deleting media with tmdbid ${media.tmdbId}`);

    const plexLibrary = (await this.plexApi.getLibraries()).find(
      (e) => +e.key === +collection.libraryId,
    );

    await this.collectionService.removeFromCollection(collection.id, [
      {
        plexId: media.plexId,
      },
    ]);

    if (plexLibrary.type === 'movie') {
      const radarrMedia = await this.servarrApi.RadarrApi.getMovieByTmdbId(
        media.tmdbId,
      );
      await this.servarrApi.RadarrApi.deleteMovie(radarrMedia.id);
    } else {
      const tmdbShow = await this.tmdbApi.getTvShow({ tvId: media.tmdbId });
      const sonarrMedia = await this.servarrApi.SonarrApi.getSeriesByTvdbId(
        tmdbShow?.external_ids?.tvdb_id,
      );
      if (sonarrMedia) {
        await this.servarrApi.SonarrApi.deleteShow(sonarrMedia.id);
      } else {
        this.infoLogger(`Couldn't find tvdbid for tmdbid ${media.tmdbId}`);
      }
    }
    await this.overseerrApi.removeMediaByTmdbId(
      media.tmdbId,
      plexLibrary.type === 'show' ? 'tv' : 'movie',
    );
    await this.plexApi.deleteMediaFromDisk(media.plexId);
    this.infoLogger(`Removed media with tmdbid ${media.tmdbId}`);
  }

  private infoLogger(message: string) {
    // this.loggerService.logger.info(message, {
    //   label: 'Collection Handler',
    // });
    this.logger.log(message);
  }
}
