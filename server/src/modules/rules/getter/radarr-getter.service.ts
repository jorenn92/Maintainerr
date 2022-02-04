import { Injectable } from '@nestjs/common';
import { PlexLibraryItem } from 'src/modules/api/plex-api/interfaces/library.interfaces';
import { RadarrApi } from 'src/modules/api/servarr-api/helpers/radarr.helper';
import { ServarrService } from 'src/modules/api/servarr-api/servarr.service';
import { TmdbIdService } from 'src/modules/api/tmdb-api/tmdb-id.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class RadarrGetterService {
  api: RadarrApi;
  plexProperties: Property[];
  constructor(
    private readonly servarrService: ServarrService,
    private readonly tmdbIdHelper: TmdbIdService,
  ) {
    this.api = servarrService.RadarrApi;
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.RADARR,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem) {
    const prop = this.plexProperties.find((el) => el.id === id);
    const tmdb = await this.tmdbIdHelper.getTmdbIdFromPlexRatingKey(
      libItem.ratingKey,
    );
    if (!tmdb) {
      console.log('id not found');
      return null;
    }

    const movieResponse = await this.servarrService.RadarrApi.getMovieByTmdbId(
      tmdb.id,
    );
    switch (prop.name) {
      case 'addDate': {
        return movieResponse.added ? new Date(movieResponse.added) : null;
      }
      case 'fileDate': {
        // console.log(movieResponse.movieFile);

        return movieResponse?.movieFile?.dateAdded
          ? new Date(movieResponse.movieFile.dateAdded)
          : null;
      }
      case 'fileQuality': {
        return movieResponse?.movieFile.quality.quality.resolution
          ? new Date(movieResponse.movieFile.quality.quality.resolution)
          : null;
      }
      case 'fileAudioChannels': {
        return movieResponse?.movieFile.mediainfo.audioChannels
          ? new Date(movieResponse.movieFile[0].mediainfo.audioChannels)
          : null;
      }
      case 'runTime': {
        return movieResponse?.movieFile.mediainfo.runTime
          ? new Date(movieResponse.movieFile[0].mediainfo.runTime)
          : null;
      }
      case 'monitored': {
        return movieResponse?.monitored ? movieResponse.monitored : null;
      }
      case 'tags': {
        return await this.servarrService.RadarrApi.getTags();
      }
      case 'fileSize': {
        return movieResponse?.sizeOnDisk ? movieResponse.sizeOnDisk : null;
      }
      case 'releaseDate': {
        return movieResponse?.physicalRelease && movieResponse?.digitalRelease
          ? (await new Date(movieResponse.physicalRelease)) >
            new Date(movieResponse.digitalRelease)
            ? new Date(movieResponse.digitalRelease)
            : new Date(movieResponse.physicalRelease)
          : movieResponse.physicalRelease
          ? new Date(movieResponse.physicalRelease)
          : movieResponse.digitalRelease
          ? new Date(movieResponse.digitalRelease)
          : null;
      }
      case 'inCinemas': {
        return movieResponse?.inCinemas
          ? new Date(movieResponse.inCinemas)
          : null;
      }
    }
  }
}
