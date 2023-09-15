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
import _ from 'lodash';

@Injectable()
export class SonarrGetterService {
  plexProperties: Property[];
  constructor(
    private readonly servarrService: ServarrService,
    private readonly plexApi: PlexApiService,
  ) {
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.SONARR,
    ).props;
  }
  async get(id: number, libItem: PlexLibraryItem, dataType?: EPlexDataType) {
    try {
      const prop = this.plexProperties.find((el) => el.id === id);
      let origLibItem = undefined;
      let season = undefined;
      let episode = undefined;
      if (
        dataType === EPlexDataType.SEASONS ||
        dataType === EPlexDataType.EPISODES
      ) {
        origLibItem = _.cloneDeep(libItem);
        season = libItem.grandparentRatingKey
          ? libItem.parentIndex
          : libItem.index;

        // get (grand)parent
        libItem = (await this.plexApi.getMetadata(
          libItem.grandparentRatingKey
            ? libItem.grandparentRatingKey
            : libItem.parentRatingKey,
        )) as unknown as PlexLibraryItem;
      }

      const tvdbId = libItem.Guid
        ? +libItem.Guid.find((el) => el.id.includes('tvdb')).id.split('://')[1]
        : libItem.guid.includes('tvdb')
        ? +libItem.guid.split('://')[1].split('?')[0]
        : null;

      const showResponse =
        await this.servarrService.SonarrApi.getSeriesByTvdbId(tvdbId);

      season = season
        ? showResponse.seasons.find((el) => el.seasonNumber === season)
        : season;

      // fetch episode or first episode of the season
      episode =
        [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType) &&
        showResponse.added !== '0001-01-01T00:00:00Z'
          ? (
              await this.servarrService.SonarrApi.getEpisodes(
                showResponse.id,
                origLibItem.grandparentRatingKey
                  ? origLibItem.parentIndex
                  : origLibItem.index,
                [origLibItem.grandparentRatingKey ? origLibItem.index : 1],
              )
            )[0]
          : undefined;

      const episodeFile =
        episode && dataType === EPlexDataType.EPISODES
          ? await this.servarrService.SonarrApi.getEpisodeFile(
              episode.episodeFileId,
            )
          : undefined;

      if (tvdbId && showResponse) {
        switch (prop.name) {
          case 'addDate': {
            return showResponse.added &&
              showResponse.added !== '0001-01-01T00:00:00Z'
              ? showResponse.added
              : null;
          }
          case 'diskSizeEntireShow': {
            if (
              [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)
            ) {
              if (dataType === EPlexDataType.EPISODES) {
                return episodeFile?.size ? +episodeFile.size / 1048576 : null;
              } else {
                return season?.statistics?.sizeOnDisk
                  ? +season.statistics.sizeOnDisk / 1048576
                  : null;
              }
            } else {
              return showResponse.statistics.sizeOnDisk
                ? +showResponse.statistics.sizeOnDisk / 1048576
                : null;
            }
          }
          case 'tags': {
            const tagIds = showResponse.tags;
            return (await this.servarrService.SonarrApi.getTags())
              .filter((el) => tagIds.includes(el.id))
              .map((el) => el.label);
          }
          case 'qualityProfileId': {
            if ([EPlexDataType.EPISODES].includes(dataType) && episodeFile) {
              return episodeFile.quality.quality.id;
            } else {
              return showResponse.qualityProfileId;
            }
          }
          case 'firstAirDate': {
            if (
              [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)
            ) {
              return episode?.airDate ? episode.airDate : null;
            } else {
              return showResponse.firstAired ? showResponse.firstAired : null;
            }
          }
          case 'seasons': {
            if (
              [EPlexDataType.SEASONS, EPlexDataType.EPISODES].includes(dataType)
            ) {
              return season?.statistics?.episodeCount
                ? +season.statistics.episodeCount
                : null;
            } else {
              return showResponse.statistics.seasonCount
                ? +showResponse.statistics.seasonCount
                : null;
            }
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
              return showResponse.added !== '0001-01-01T00:00:00Z' && season
                ? season.monitored
                  ? 1
                  : 0
                : null;
            }

            if (dataType === EPlexDataType.EPISODES) {
              return showResponse.added !== '0001-01-01T00:00:00Z' && episode
                ? episode.monitored
                  ? 1
                  : 0
                : null;
            }

            return showResponse.added !== '0001-01-01T00:00:00Z'
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
