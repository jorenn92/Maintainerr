import { Injectable } from '@nestjs/common';
import { warn } from 'console';
import { PlexLibraryItem } from '../../../modules/api/plex-api/interfaces/library.interfaces';
import { SonarrApi } from '../../../modules/api/servarr-api/helpers/sonarr.helper';
import { ServarrService } from '../../../modules/api/servarr-api/servarr.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';
import { EPlexDataType } from 'src/modules/api/plex-api/enums/plex-data-type-enum';
import { PlexApiService } from 'src/modules/api/plex-api/plex-api.service';

@Injectable()
export class SonarrGetterService {
  api: SonarrApi;
  plexProperties: Property[];
  constructor(
    private readonly servarrService: ServarrService,
    private readonly plexApi: PlexApiService,
  ) {
    this.api = servarrService.SonarrApi;
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.SONARR,
    ).props;
  }
  // TODO: fix season and episode rules
  async get(id: number, libItem: PlexLibraryItem, dataType?: EPlexDataType) {
    try {
      const prop = this.plexProperties.find((el) => el.id === id);
      let season = undefined;
      if (libItem.type === 'season' || libItem.type === 'episode') {
        season = libItem.index;
        // get parent from plex
        libItem = (await this.plexApi.getMetadata(
          libItem.parentRatingKey,
        )) as unknown as PlexLibraryItem;
      }

      const tvdbId = libItem.Guid
        ? +libItem.Guid.find((el) => el.id.includes('tvdb')).id.split('://')[1]
        : libItem.guid.includes('tvdb')
        ? +libItem.guid.split('://')[1].split('?')[0]
        : null;

      const showResponse =
        await this.servarrService.SonarrApi.getSeriesByTvdbId(tvdbId);

      if (tvdbId && showResponse) {
        switch (prop.name) {
          case 'addDate': {
            return showResponse.added ? showResponse.added : null;
          }
          case 'diskSizeEntireShow': {
            return showResponse.statistics.sizeOnDisk
              ? +showResponse.statistics.sizeOnDisk
              : null;
          }
          case 'tags': {
            const tagIds = showResponse.tags;
            return (await this.servarrService.SonarrApi.getTags())
              .filter((el) => tagIds.includes(el.id))
              .map((el) => el.label);
          }
          case 'qualityProfileId': {
            return (await this.servarrService.SonarrApi.getProfiles())
              .filter((el) => el.id === showResponse.qualityProfileId)
              .map((el) => el.name);
          }
          case 'firstAirDate': {
            return showResponse.firstAired ? showResponse.firstAired : null;
          }
          case 'seasons': {
            return showResponse.statistics.seasonCount
              ? +showResponse.statistics.seasonCount
              : null;
          }
          case 'status': {
            return showResponse.status ? showResponse.status : null;
          }
          case 'ended': {
            return showResponse.ended !== undefined
              ? showResponse.ended
                ? 1
                : 0
              : null;
          }
          case 'monitored': {
            if (dataType === EPlexDataType.SEASONS) {
              return showResponse.seasons[season] !== undefined
                ? showResponse.seasons[season].monitored
                  ? 1
                  : 0
                : null;
            }

            return showResponse.monitored !== undefined
              ? showResponse.monitored
                ? 1
                : 0
              : null;
          }
        }
      } else return null;
    } catch (e) {
      warn(`Sonarr-Getter - Action failed : ${e.message}`);
      return undefined;
    }
  }
}
