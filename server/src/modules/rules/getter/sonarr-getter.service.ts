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
    try {
      const prop = this.plexProperties.find((el) => el.id === id);
      const tvdbId = libItem.Guid
        ? +libItem.Guid.find((el) => el.id.includes('tvdb')).id.split('://')[1]
        : libItem.guid.includes('tvdb')
        ? +libItem.guid.split('://')[1].split('?')[0]
        : null;
      const showResponse =
        await this.servarrService.SonarrApi.getSeriesByTvdbId(tvdbId);
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
