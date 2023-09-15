import { Injectable } from '@nestjs/common';
import { warn } from 'console';
import { PlexLibraryItem } from '../../../modules/api/plex-api/interfaces/library.interfaces';
import { RadarrApi } from '../../../modules/api/servarr-api/helpers/radarr.helper';
import { ServarrService } from '../../../modules/api/servarr-api/servarr.service';
import { TmdbIdService } from '../../../modules/api/tmdb-api/tmdb-id.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';
import { EPlexDataType } from 'src/modules/api/plex-api/enums/plex-data-type-enum';

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

  async get(id: number, libItem: PlexLibraryItem, dataType?: EPlexDataType) {
    try {
      const prop = this.plexProperties.find((el) => el.id === id);
      const tmdb = await this.tmdbIdHelper.getTmdbIdFromPlexRatingKey(
        libItem.ratingKey,
      );
      if (!tmdb) {
        return null;
      }

      const movieResponse =
        await this.servarrService.RadarrApi.getMovieByTmdbId(tmdb.id);
      switch (prop.name) {
        case 'addDate': {
          return movieResponse.added ? new Date(movieResponse.added) : null;
        }
        case 'fileDate': {
          return movieResponse?.movieFile?.dateAdded
            ? new Date(movieResponse.movieFile.dateAdded)
            : null;
        }
        case 'fileQuality': {
          return movieResponse?.movieFile.quality.quality.resolution
            ? movieResponse.movieFile.quality.quality.resolution
            : null;
        }
        case 'fileAudioChannels': {
          return movieResponse?.movieFile
            ? movieResponse.movieFile.mediaInfo?.audioChannels
            : null;
        }
        case 'runTime': {
          if (movieResponse?.movieFile.mediaInfo.runTime) {
            const hms = movieResponse.movieFile.mediaInfo.runTime;
            const splitted = hms.split(':');
            return +splitted[0] * 60 + +splitted[1];
          }
          return null;
        }
        case 'monitored': {
          return movieResponse?.monitored
            ? movieResponse.monitored
              ? 1
              : 0
            : null;
        }
        case 'tags': {
          const movieTags = movieResponse?.tags;
          return (await this.servarrService.RadarrApi.getTags())
            ?.filter((el) => movieTags.includes(el.id))
            .map((el) => el.label);
        }
        case 'profile': {
          const movieProfile = movieResponse?.qualityProfileId;

          return (await this.servarrService.RadarrApi.getProfiles())?.find(
            (el) => el.id === movieProfile,
          ).name;
        }
        case 'fileSize': {
          return movieResponse?.sizeOnDisk
            ? Math.round(movieResponse.sizeOnDisk / 1048576)
            : null;
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
    } catch (e) {
      warn(`Radarr-Getter - Action failed : ${e.message}`);
      return undefined;
    }
  }
}
