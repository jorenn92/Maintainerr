import { Injectable } from '@nestjs/common';
import { PlexLibraryItem } from 'src/modules/api/plex-api/interfaces/library.interfaces';
import { RadarrApi } from 'src/modules/api/servarr-api/helpers/radarr.helper';
import { ServarrService } from 'src/modules/api/servarr-api/servarr.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class RadarrGetterService {
  api: RadarrApi;
  plexProperties: Property[];
  constructor(private readonly servarrService: ServarrService) {
    this.api = servarrService.RadarrApi;
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.RADARR,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem) {
    const prop = this.plexProperties.find((el) => el.id === id);
    const movieResponse = await this.servarrService.RadarrApi.getMovieByTmdbId(
      +libItem.ratingKey,
    );
    switch (prop.name) {
      case 'addDate': {
        return movieResponse.added ? new Date(movieResponse.added) : null;
      }
      case 'fileDate': {
        return movieResponse.movieFile[0].dateAdded
          ? new Date(movieResponse.movieFile[0].dateAdded)
          : null;
      }
      case 'fileQuality': {
        return movieResponse.movieFile[0].quality.quality.resolution
          ? new Date(movieResponse.movieFile[0].quality.quality.resolution)
          : null;
      }
      case 'fileAudioChannels': {
        return movieResponse.movieFile[0].mediainfo.audioChannels
          ? new Date(movieResponse.movieFile[0].mediainfo.audioChannels)
          : null;
      }
      case 'runTime': {
        return movieResponse.movieFile[0].mediainfo.runTime
          ? new Date(movieResponse.movieFile[0].mediainfo.runTime)
          : null;
      }
      case 'monitored': {
        return movieResponse.monitored ? movieResponse.monitored : null;
      }
      case 'tags': {
        return await this.servarrService.RadarrApi.getTags();
      }
      case 'fileSize': {
        return movieResponse.sizeOnDisk ? movieResponse.sizeOnDisk : null;
      }
      case 'releaseDate': {
        return movieResponse.physicalRelease && movieResponse.digitalRelease
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
        return movieResponse.inCinemas
          ? new Date(movieResponse.inCinemas)
          : null;
      }
    }
  }
}
