import { Injectable } from '@nestjs/common';
import { PlexLibraryItem } from 'src/modules/api/plex-api/interfaces/library.interfaces';
import { SonarrApi } from 'src/modules/api/servarr-api/helpers/sonarr.helper';
import { ServarrService } from 'src/modules/api/servarr-api/servarr.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class SonarrGetterService {
  api: SonarrApi;
  plexProperties: Property[];
  constructor(private readonly servarrService: ServarrService) {
    this.api = servarrService.SonarrApi;
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.SONARR,
    ).props;
  }
  async get(id: number, libItem: PlexLibraryItem) {
    const prop = this.plexProperties.find((el) => el.id === id);
    const tvdbId = libItem.Guid
      ? +libItem.Guid.find((el) => el.id.includes('tvdb')).id.split('://')[1]
      : libItem.guid.includes('tvdb')
      ? +libItem.guid.split('://')[1].split('?')[0]
      : null;
    const showResponse = await this.servarrService.SonarrApi.getSeriesByTvdbId(
      tvdbId,
    );
    if (tvdbId) {
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
          return showResponse.tags ? +showResponse.tags : null;
        }
        case 'qualityProfileId': {
          return showResponse.qualityProfileId
            ? +showResponse.qualityProfileId
            : null;
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
          return showResponse.ended ? showResponse.ended : null;
        }
        case 'monitored': {
          return showResponse.monitored ? showResponse.monitored : null;
        }
      }
    } else return null;
  }
}
